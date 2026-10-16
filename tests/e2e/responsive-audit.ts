import type { Page } from "@playwright/test";

export type AuditIssue = {
  type: string;
  selector: string;
  detail: string;
};

const candidateSelector =
  'a,button,input,select,textarea,[role="button"],[role="dialog"],h1,h2,h3,h4,p,table,img';

export async function collectResponsiveIssues(page: Page): Promise<AuditIssue[]> {
  return page.evaluate((selector) => {
    const issues: AuditIssue[] = [];
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const visible = (element: Element) => {
      const node = element as HTMLElement;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const describeElement = (element: Element) => {
      const node = element as HTMLElement;
      const tag = node.tagName.toLowerCase();
      const id = node.id ? `#${node.id}` : "";
      const classes =
        typeof node.className === "string"
          ? node.className.trim().split(/\s+/).slice(0, 2).join(".")
          : "";
      return `${tag}${id}${classes ? `.${classes}` : ""}`;
    };
    const hasScrollableAncestor = (element: Element) => {
      let parent = element.parentElement;
      while (parent) {
        const parentStyle = getComputedStyle(parent);
        if (["auto", "scroll"].includes(parentStyle.overflowX)) return true;
        parent = parent.parentElement;
      }
      return false;
    };
    const candidates = [...document.querySelectorAll(selector)].filter(visible);
    if (document.documentElement.scrollWidth > viewport.width + 1) {
      issues.push({
        type: "horizontal-overflow",
        selector: "document",
        detail: `scrollWidth=${document.documentElement.scrollWidth}, viewport=${viewport.width}`,
      });
    }
    for (const element of candidates) {
      const node = element as HTMLElement;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      if (
        (rect.left < -1 || rect.right > viewport.width + 1) &&
        style.position !== "fixed" &&
        style.position !== "sticky" &&
        !hasScrollableAncestor(element)
      ) {
        issues.push({
          type: "outside-viewport",
          selector: describeElement(element),
          detail: `left=${rect.left}, right=${rect.right}, viewport=${viewport.width}`,
        });
      }
      const clipsContent =
        ["hidden", "clip"].includes(style.overflow) ||
        ["hidden", "clip"].includes(style.overflowX) ||
        ["hidden", "clip"].includes(style.overflowY) ||
        style.whiteSpace === "nowrap";
      if (
        (element.matches('button,a,input,select,textarea,[role="button"]') ||
          /^H[1-4]$/.test(node.tagName)) &&
        clipsContent &&
        style.textOverflow !== "ellipsis" &&
        (node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1)
      ) {
        issues.push({
          type: "content-clipped",
          selector: describeElement(element),
          detail: `client=${node.clientWidth}x${node.clientHeight}, scroll=${node.scrollWidth}x${node.scrollHeight}`,
        });
      }
    }
    const interactive = candidates.filter((element) =>
      element.matches('button,a,input,select,textarea,[role="button"]'),
    );
    for (let index = 0; index < interactive.length; index += 1) {
      for (let next = index + 1; next < interactive.length; next += 1) {
        const first = interactive[index];
        const second = interactive[next];
        if (first.contains(second) || second.contains(first)) continue;
        const firstPosition = getComputedStyle(first).position;
        const secondPosition = getComputedStyle(second).position;
        if (
          (firstPosition === "fixed" && secondPosition !== "fixed") ||
          (secondPosition === "fixed" && firstPosition !== "fixed")
        )
          continue;
        if (
          first.parentElement === second.parentElement &&
          (first.matches("input") || second.matches("input"))
        )
          continue;
        const a = first.getBoundingClientRect();
        const b = second.getBoundingClientRect();
        const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (Math.min(a.bottom, b.bottom) > viewport.height - 80) continue;
        if (overlapWidth > 2 && overlapHeight > 2) {
          issues.push({
            type: "interactive-overlap",
            selector: `${describeElement(first)} <> ${describeElement(second)}`,
            detail: `overlap=${overlapWidth.toFixed(1)}x${overlapHeight.toFixed(1)}`,
          });
        }
      }
    }
    return issues;
  }, candidateSelector);
}
