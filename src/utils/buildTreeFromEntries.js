export function buildTreeFromEntries(entries, basePath = "") {
  const root = {};

  for (const entry of entries) {
    let relativePath = entry.path_display;

    if (
      basePath &&
      relativePath.toLowerCase().startsWith(basePath.toLowerCase())
    ) {
      relativePath = relativePath.slice(basePath.length);
    }

    const parts = relativePath.split("/").filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isLeaf = index === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          name: part,
          tag: isLeaf ? entry[".tag"] : "folder",
          path: "/" + parts.slice(0, index + 1).join("/"),
          ...(isLeaf
            ? {
                id: entry.id,
                rev: entry.rev,
                size: entry.size,
                client_modified: entry.client_modified,
                server_modified: entry.server_modified,
              }
            : {}),
          children: {},
        };
      }

      current = current[part].children;
    });
  }

  const toArray = (node) =>
    Object.values(node).map((n) => ({
      ...n,
      children: n.tag === "folder" ? toArray(n.children) : [],
    }));

  return toArray(root);
}
