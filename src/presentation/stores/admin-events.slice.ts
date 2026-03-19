import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminEventsSlice = {
  createEvent: ReturnType<typeof useAdminOperationsSlice>['createEvent'];
  createEventAndLinkCategories: ReturnType<typeof useAdminOperationsSlice>['createEventAndLinkCategories'];
  updateEvent: ReturnType<typeof useAdminOperationsSlice>['updateEvent'];
  updateEventAndLinkCategories: ReturnType<typeof useAdminOperationsSlice>['updateEventAndLinkCategories'];
  getEventDeleteImpact: ReturnType<typeof useAdminOperationsSlice>['getEventDeleteImpact'];
  removeEvent: ReturnType<typeof useAdminOperationsSlice>['removeEvent'];
};

export const useAdminEventsSlice = (): AdminEventsSlice => {
  const {
    createEvent,
    createEventAndLinkCategories,
    updateEvent,
    updateEventAndLinkCategories,
    getEventDeleteImpact,
    removeEvent,
  } = useAdminOperationsSlice();

  return {
    createEvent,
    createEventAndLinkCategories,
    updateEvent,
    updateEventAndLinkCategories,
    getEventDeleteImpact,
    removeEvent,
  };
};
