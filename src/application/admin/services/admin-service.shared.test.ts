import { ApiError } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

describe("admin-service.shared", () => {
  it("maps self-review scope conflict error code", () => {
    const error = new ApiError(
      422,
      "JUDGE_SELF_REVIEW_SCOPE_CONFLICT",
      "JUDGE_SELF_REVIEW_SCOPE_CONFLICT",
    );

    const message = toErrorMessage(error, "fallback");

    expect(message).toBe(
      "No puedes asignar este alcance: el juez ya tiene maquetas propias dentro de esa categoria.",
    );
  });
});
