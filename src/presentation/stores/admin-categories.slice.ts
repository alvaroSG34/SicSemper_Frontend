import { useAdminOperationsSlice } from './admin-operations.slice';

export type AdminCategoriesSlice = {
  createCategory: ReturnType<typeof useAdminOperationsSlice>['createCategory'];
  updateCategory: ReturnType<typeof useAdminOperationsSlice>['updateCategory'];
  getCategoryDeleteImpact: ReturnType<typeof useAdminOperationsSlice>['getCategoryDeleteImpact'];
  removeCategory: ReturnType<typeof useAdminOperationsSlice>['removeCategory'];
  createSubcategory: ReturnType<typeof useAdminOperationsSlice>['createSubcategory'];
  updateSubcategory: ReturnType<typeof useAdminOperationsSlice>['updateSubcategory'];
  removeSubcategory: ReturnType<typeof useAdminOperationsSlice>['removeSubcategory'];
};

export const useAdminCategoriesSlice = (): AdminCategoriesSlice => {
  const {
    createCategory,
    updateCategory,
    getCategoryDeleteImpact,
    removeCategory,
    createSubcategory,
    updateSubcategory,
    removeSubcategory,
  } = useAdminOperationsSlice();

  return {
    createCategory,
    updateCategory,
    getCategoryDeleteImpact,
    removeCategory,
    createSubcategory,
    updateSubcategory,
    removeSubcategory,
  };
};
