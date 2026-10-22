#!/usr/bin/env python3
"""Assemble the site: src/pages/*.html + _partials/*.html -> ./*.html

Pages contain markers like <!--#head-->, <!--#header--> and <!--#footer-->.
Each marker is replaced with the matching file from _partials/. The current
page's nav link is given aria-current="page" based on <body data-page="...">.

Run:  python3 scripts/build.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "src" / "pages"
PARTIALS = ROOT / "_partials"

MARKER = re.compile(r"^([ \t]*)<!--#([a-z0-9_-]+)-->[ \t]*$", re.M)


def indent(text: str, prefix: str) -> str:
    lines = text.rstrip("\n").split("\n")
    return "\n".join((prefix + line) if line.strip() else line for line in lines)


def build_page(src: Path) -> Path:
    html = src.read_text(encoding="utf-8")
    page = re.search(r'<body[^>]*data-page="([^"]+)"', html)
    page_id = page.group(1) if page else src.stem

    def replace(m: re.Match) -> str:
        name = m.group(2)
        partial = PARTIALS / f"{name}.html"
        if not partial.exists():
            sys.exit(f"{src.name}: no partial named {name!r} in {PARTIALS}")
        body = partial.read_text(encoding="utf-8")
        if name == "header":
            body = body.replace(
                f'data-page="{page_id}"',
                f'data-page="{page_id}" aria-current="page"',
            )
        return indent(body, m.group(1))

    out = MARKER.sub(replace, html)
    dest = ROOT / src.name
    dest.write_text(out, encoding="utf-8")
    return dest


def main() -> None:
    built = [build_page(p) for p in sorted(PAGES.glob("*.html"))]
    for d in built:
        print(f"built {d.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
