import { groupJudgeAssignedScopes } from "./judge-assigned-scopes";

describe("groupJudgeAssignedScopes", () => {
  it("agrupa por categoria, deduplica subcategorias y preserva alcance general", () => {
    const result = groupJudgeAssignedScopes([
      { categoryName: "Aeronaves", subcategoryName: "Jets" },
      { categoryName: "Aeronaves", subcategoryName: "Jets" },
      { categoryName: "Aeronaves", subcategoryName: "Helicopteros" },
      { categoryName: "Aeronaves", subcategoryName: null },
      { categoryName: "Naval", subcategoryName: null },
    ]);

    expect(result).toEqual([
      {
        categoryName: "Aeronaves",
        includesGeneralScope: true,
        subcategories: ["Helicopteros", "Jets"],
      },
      {
        categoryName: "Naval",
        includesGeneralScope: true,
        subcategories: [],
      },
    ]);
  });
});
