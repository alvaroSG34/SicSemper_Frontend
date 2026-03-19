import { useAdminStore } from './admin.store';

export type AdminOperationsSlice = {
  createClub: ReturnType<typeof useAdminStore.getState>['createClub'];
  updateClub: ReturnType<typeof useAdminStore.getState>['updateClub'];
  getClubDeleteImpact: ReturnType<typeof useAdminStore.getState>['getClubDeleteImpact'];
  removeClub: ReturnType<typeof useAdminStore.getState>['removeClub'];
  createEvent: ReturnType<typeof useAdminStore.getState>['createEvent'];
  createEventAndLinkCategories: ReturnType<typeof useAdminStore.getState>['createEventAndLinkCategories'];
  updateEvent: ReturnType<typeof useAdminStore.getState>['updateEvent'];
  updateEventAndLinkCategories: ReturnType<typeof useAdminStore.getState>['updateEventAndLinkCategories'];
  getEventDeleteImpact: ReturnType<typeof useAdminStore.getState>['getEventDeleteImpact'];
  removeEvent: ReturnType<typeof useAdminStore.getState>['removeEvent'];
  createCategory: ReturnType<typeof useAdminStore.getState>['createCategory'];
  updateCategory: ReturnType<typeof useAdminStore.getState>['updateCategory'];
  getCategoryDeleteImpact: ReturnType<typeof useAdminStore.getState>['getCategoryDeleteImpact'];
  removeCategory: ReturnType<typeof useAdminStore.getState>['removeCategory'];
  createSubcategory: ReturnType<typeof useAdminStore.getState>['createSubcategory'];
  updateSubcategory: ReturnType<typeof useAdminStore.getState>['updateSubcategory'];
  removeSubcategory: ReturnType<typeof useAdminStore.getState>['removeSubcategory'];
  createAdmin: ReturnType<typeof useAdminStore.getState>['createAdmin'];
  promoteToAdmin: ReturnType<typeof useAdminStore.getState>['promoteToAdmin'];
  demoteAdmin: ReturnType<typeof useAdminStore.getState>['demoteAdmin'];
  promoteToJudge: ReturnType<typeof useAdminStore.getState>['promoteToJudge'];
  demoteJudge: ReturnType<typeof useAdminStore.getState>['demoteJudge'];
  banParticipant: ReturnType<typeof useAdminStore.getState>['banParticipant'];
  unbanParticipant: ReturnType<typeof useAdminStore.getState>['unbanParticipant'];
  assignJudgeScope: ReturnType<typeof useAdminStore.getState>['assignJudgeScope'];
  removeJudgeScope: ReturnType<typeof useAdminStore.getState>['removeJudgeScope'];
};

export const useAdminOperationsSlice = (): AdminOperationsSlice => {
  const createClub = useAdminStore((state) => state.createClub);
  const updateClub = useAdminStore((state) => state.updateClub);
  const getClubDeleteImpact = useAdminStore((state) => state.getClubDeleteImpact);
  const removeClub = useAdminStore((state) => state.removeClub);

  const createEvent = useAdminStore((state) => state.createEvent);
  const createEventAndLinkCategories = useAdminStore((state) => state.createEventAndLinkCategories);
  const updateEvent = useAdminStore((state) => state.updateEvent);
  const updateEventAndLinkCategories = useAdminStore((state) => state.updateEventAndLinkCategories);
  const getEventDeleteImpact = useAdminStore((state) => state.getEventDeleteImpact);
  const removeEvent = useAdminStore((state) => state.removeEvent);

  const createCategory = useAdminStore((state) => state.createCategory);
  const updateCategory = useAdminStore((state) => state.updateCategory);
  const getCategoryDeleteImpact = useAdminStore((state) => state.getCategoryDeleteImpact);
  const removeCategory = useAdminStore((state) => state.removeCategory);
  const createSubcategory = useAdminStore((state) => state.createSubcategory);
  const updateSubcategory = useAdminStore((state) => state.updateSubcategory);
  const removeSubcategory = useAdminStore((state) => state.removeSubcategory);

  const createAdmin = useAdminStore((state) => state.createAdmin);
  const promoteToAdmin = useAdminStore((state) => state.promoteToAdmin);
  const demoteAdmin = useAdminStore((state) => state.demoteAdmin);

  const promoteToJudge = useAdminStore((state) => state.promoteToJudge);
  const demoteJudge = useAdminStore((state) => state.demoteJudge);

  const banParticipant = useAdminStore((state) => state.banParticipant);
  const unbanParticipant = useAdminStore((state) => state.unbanParticipant);

  const assignJudgeScope = useAdminStore((state) => state.assignJudgeScope);
  const removeJudgeScope = useAdminStore((state) => state.removeJudgeScope);

  return {
    createClub,
    updateClub,
    getClubDeleteImpact,
    removeClub,
    createEvent,
    createEventAndLinkCategories,
    updateEvent,
    updateEventAndLinkCategories,
    getEventDeleteImpact,
    removeEvent,
    createCategory,
    updateCategory,
    getCategoryDeleteImpact,
    removeCategory,
    createSubcategory,
    updateSubcategory,
    removeSubcategory,
    createAdmin,
    promoteToAdmin,
    demoteAdmin,
    promoteToJudge,
    demoteJudge,
    banParticipant,
    unbanParticipant,
    assignJudgeScope,
    removeJudgeScope,
  };
};
