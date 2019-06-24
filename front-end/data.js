export const DATA = {
    prepareData: (nodes, relationship, borderWidth) => {
        const elements = [];
        for (let i = 0; i < nodes.length; i++) {
            elements.push({
                data: {
                    id: nodes[i].id,
                    title: nodes[i].title,
                    description: nodes[i].description,
                    background: nodes[i].style.background,
                    size: nodes[i].style.size,
                    borderWidth: borderWidth
                },
                group: "nodes",
                grabbable: true,
            });
        }

        for (let i = 0; i < relationship.length; i++) {
            elements.push({
                data: {
                    id: relationship[i].id,
                    source: relationship[i].parent_node_id,
                    target: relationship[i].child_node_id,
                },
                group: "edges",
                grabbable: true
            })
        }

        return elements;
    }
}