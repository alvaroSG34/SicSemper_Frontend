import type { StateCreator } from "zustand";
import { adminService } from "@/application/admin/admin.service";
import type { AdminStoreState } from "./admin.store.types";
import { executeMutation, getErrorMessage } from "./admin.store.shared";

type AdminMutationsStoreSlice = Pick<
  AdminStoreState,
  | "createClub"
  | "updateClub"
  | "getClubDeleteImpact"
  | "removeClub"
  | "promoteToJudge"
  | "demoteJudge"
  | "createJudge"
  | "createAdmin"
  | "promoteToAdmin"
  | "demoteAdmin"
  | "banParticipant"
  | "unbanParticipant"
  | "setParticipantVerified"
  | "createEvent"
  | "createEventAndLinkCategories"
  | "updateEvent"
  | "updateEventAndLinkCategories"
  | "getEventDeleteImpact"
  | "createEventCategoryLink"
  | "removeEventCategoryLink"
  | "removeEvent"
  | "createCategory"
  | "updateCategory"
  | "getCategoryDeleteImpact"
  | "removeCategory"
  | "createSubcategory"
  | "updateSubcategory"
  | "removeSubcategory"
  | "assignJudgeScope"
  | "removeJudgeScope"
>;

export const createAdminMutationsStoreSlice: StateCreator<
  AdminStoreState,
  [],
  [],
  AdminMutationsStoreSlice
> = (set) => ({
  createClub: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createClub(payload);
    });
  },
  updateClub: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateClub(payload);
    });
  },
  getClubDeleteImpact: async (clubId) => {
    return adminService.getClubDeleteImpact(clubId);
  },
  removeClub: async (clubId) => {
    await executeMutation(set, async () => {
      await adminService.removeClub(clubId);
    });
  },
  promoteToJudge: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.promoteToJudge(userId);
    });
  },
  demoteJudge: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.demoteJudge(userId);
    });
  },
  createJudge: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createJudge(payload);
    });
  },
  createAdmin: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createAdmin(payload);
    });
  },
  promoteToAdmin: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.promoteToAdmin(userId);
    });
  },
  demoteAdmin: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.demoteAdmin(userId);
    });
  },
  banParticipant: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.banParticipant(userId);
    });
  },
  unbanParticipant: async (userId) => {
    await executeMutation(set, async () => {
      await adminService.unbanParticipant(userId);
    });
  },
  setParticipantVerified: async (userId, verified) => {
    await executeMutation(set, async () => {
      await adminService.setParticipantVerified(userId, verified);
    });
  },
  createEvent: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createEvent(payload);
    });
  },
  createEventAndLinkCategories: async (payload, categoryIds) => {
    await executeMutation(set, async () => {
      await adminService.createEventAndLinkCategories(payload, categoryIds);
    });
  },
  updateEvent: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateEvent(payload);
    });
  },
  updateEventAndLinkCategories: async (payload, categoryIds) => {
    await executeMutation(set, async () => {
      await adminService.updateEventAndLinkCategories(payload, categoryIds);
    });
  },
  getEventDeleteImpact: async (eventId) => {
    return adminService.getEventDeleteImpact(eventId);
  },
  createEventCategoryLink: async (payload) => {
    set({ loading: true, error: null });
    try {
      const created = await adminService.createEventCategoryLink(payload);
      set({ loading: false, error: null });
      return created;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  removeEventCategoryLink: async (eventCategoryId) => {
    set({ loading: true, error: null });
    try {
      await adminService.removeEventCategoryLink(eventCategoryId);
      set({ loading: false, error: null });
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },
  removeEvent: async (eventId) => {
    await executeMutation(set, async () => {
      await adminService.removeEvent(eventId);
    });
  },
  createCategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createCategory(payload);
    });
  },
  updateCategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateCategory(payload);
    });
  },
  getCategoryDeleteImpact: async (categoryId) => {
    return adminService.getCategoryDeleteImpact(categoryId);
  },
  removeCategory: async (categoryId) => {
    await executeMutation(set, async () => {
      await adminService.removeCategory(categoryId);
    });
  },
  createSubcategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.createSubcategory(payload);
    });
  },
  updateSubcategory: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.updateSubcategory(payload);
    });
  },
  removeSubcategory: async (subcategoryId) => {
    await executeMutation(set, async () => {
      await adminService.removeSubcategory(subcategoryId);
    });
  },
  assignJudgeScope: async (payload) => {
    await executeMutation(set, async () => {
      await adminService.assignJudgeScope(payload);
    });
  },
  removeJudgeScope: async (assignmentId) => {
    await executeMutation(set, async () => {
      await adminService.removeJudgeScope(assignmentId);
    });
  },
});
