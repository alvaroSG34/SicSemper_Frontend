import { useMemo, useState, type FormEvent } from 'react';
import type {
  CatalogCategory,
  CatalogSubcategory,
  CategoryDeleteImpact,
} from '@/domain/admin/admin.types';
import { useAdminOperations } from './use-admin-operations';
import { useAdminStore } from '@/presentation/stores/admin.store';

type CategoryModalMode = 'create' | 'edit';
type CategoryFormState = {
  name: string;
};

type SubcategoryModalMode = 'create' | 'edit';
type SubcategoryFormState = {
  name: string;
};

const emptyCategoryForm: CategoryFormState = {
  name: '',
};

const emptySubcategoryForm: SubcategoryFormState = {
  name: '',
};

type UseAdminCategoriesParams = {
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
};

export const useAdminCategories = ({
  categories,
  subcategories,
}: UseAdminCategoriesParams) => {
  const {
    createCategory,
    updateCategory,
    getCategoryDeleteImpact,
    removeCategory,
    createSubcategory,
    updateSubcategory,
    removeSubcategory,
  } = useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [categoryModalMode, setCategoryModalMode] =
    useState<CategoryModalMode | null>(null);
  const [categoryModalTargetId, setCategoryModalTargetId] = useState<
    string | null
  >(null);
  const [categoryForm, setCategoryForm] =
    useState<CategoryFormState>(emptyCategoryForm);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
  );
  const [subcategoryModalMode, setSubcategoryModalMode] =
    useState<SubcategoryModalMode | null>(null);
  const [subcategoryModalTargetId, setSubcategoryModalTargetId] = useState<
    string | null
  >(null);
  const [subcategoryModalCategoryId, setSubcategoryModalCategoryId] = useState<
    string | null
  >(null);
  const [subcategoryForm, setSubcategoryForm] =
    useState<SubcategoryFormState>(emptySubcategoryForm);
  const [subcategoryDeleteModal, setSubcategoryDeleteModal] = useState<{
    subcategoryId: string;
    subcategoryName: string;
    categoryId: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [categoryDeleteImpactModal, setCategoryDeleteImpactModal] = useState<{
    categoryId: string;
    categoryName: string;
    impact: CategoryDeleteImpact | null;
    loading: boolean;
    error: string | null;
  } | null>(null);
  const [categoryDeleteConfirmText, setCategoryDeleteConfirmText] =
    useState('');

  const subcategoriesByCategoryId = useMemo(() => {
    const map = new Map<string, CatalogSubcategory[]>();
    subcategories.forEach((subcategory) => {
      const current = map.get(subcategory.categoryId) ?? [];
      current.push(subcategory);
      map.set(subcategory.categoryId, current);
    });
    return map;
  }, [subcategories]);

  const executeAction = async (
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionKey);
    setActionFeedback(null);
    clearError();

    try {
      await action();
      const latestError = useAdminStore.getState().error;
      if (latestError) {
        setActionFeedback({ type: 'error', message: latestError });
        return false;
      }

      setActionFeedback({ type: 'success', message: successMessage });
      return true;
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAction((current) => (current === actionKey ? null : current));
    }
  };

  const openCreateCategoryModal = () => {
    setActionFeedback(null);
    clearError();
    setCategoryModalMode('create');
    setCategoryModalTargetId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const openEditCategoryModal = (category: CatalogCategory) => {
    setActionFeedback(null);
    clearError();
    setCategoryModalMode('edit');
    setCategoryModalTargetId(category.id);
    setCategoryForm({
      name: category.name,
    });
  };

  const closeCategoryModal = () => {
    if (pendingAction === 'category:create') {
      return;
    }
    if (
      categoryModalTargetId &&
      pendingAction === `category:update:${categoryModalTargetId}`
    ) {
      return;
    }

    setCategoryModalMode(null);
    setCategoryModalTargetId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const handleSubmitCategoryModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Completa el nombre de la categoria.',
      });
      return;
    }

    if (categoryModalMode === 'create') {
      const success = await executeAction(
        'category:create',
        'Categoria creada correctamente.',
        () =>
          createCategory({
            name: categoryForm.name,
          }),
      );

      if (success) {
        closeCategoryModal();
      }
      return;
    }

    if (categoryModalMode === 'edit' && categoryModalTargetId) {
      const success = await executeAction(
        `category:update:${categoryModalTargetId}`,
        'Categoria actualizada correctamente.',
        () =>
          updateCategory({
            id: categoryModalTargetId,
            name: categoryForm.name,
          }),
      );

      if (success) {
        closeCategoryModal();
      }
    }
  };

  const openCreateSubcategoryModal = (categoryId: string) => {
    setActionFeedback(null);
    clearError();
    setSubcategoryModalMode('create');
    setSubcategoryModalTargetId(null);
    setSubcategoryModalCategoryId(categoryId);
    setSubcategoryForm(emptySubcategoryForm);
  };

  const openEditSubcategoryModal = (subcategory: CatalogSubcategory) => {
    setActionFeedback(null);
    clearError();
    setSubcategoryModalMode('edit');
    setSubcategoryModalTargetId(subcategory.id);
    setSubcategoryModalCategoryId(subcategory.categoryId);
    setSubcategoryForm({ name: subcategory.name });
  };

  const closeSubcategoryModal = () => {
    if (pendingAction === 'subcategory:create') return;
    if (
      subcategoryModalTargetId &&
      pendingAction === `subcategory:update:${subcategoryModalTargetId}`
    ) {
      return;
    }
    setSubcategoryModalMode(null);
    setSubcategoryModalTargetId(null);
    setSubcategoryModalCategoryId(null);
    setSubcategoryForm(emptySubcategoryForm);
  };

  const handleSubmitSubcategoryModal = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!subcategoryForm.name.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Completa el nombre de la subcategoria.',
      });
      return;
    }

    if (subcategoryModalMode === 'create' && subcategoryModalCategoryId) {
      const success = await executeAction(
        'subcategory:create',
        'Subcategoria creada correctamente.',
        () =>
          createSubcategory({
            categoryId: subcategoryModalCategoryId,
            name: subcategoryForm.name,
          }),
      );
      if (success) closeSubcategoryModal();
      return;
    }

    if (
      subcategoryModalMode === 'edit' &&
      subcategoryModalTargetId &&
      subcategoryModalCategoryId
    ) {
      const success = await executeAction(
        `subcategory:update:${subcategoryModalTargetId}`,
        'Subcategoria actualizada correctamente.',
        () =>
          updateSubcategory({
            id: subcategoryModalTargetId,
            categoryId: subcategoryModalCategoryId,
            name: subcategoryForm.name,
          }),
      );
      if (success) closeSubcategoryModal();
    }
  };

  const openSubcategoryDeleteModal = (
    subcategoryId: string,
    subcategoryName: string,
    categoryId: string,
  ) => {
    setActionFeedback(null);
    clearError();
    setSubcategoryDeleteModal({ subcategoryId, subcategoryName, categoryId });
  };

  const closeSubcategoryDeleteModal = () => {
    if (
      subcategoryDeleteModal &&
      pendingAction === `subcategory:delete:${subcategoryDeleteModal.subcategoryId}`
    ) {
      return;
    }
    setSubcategoryDeleteModal(null);
  };

  const confirmDeleteSubcategory = async () => {
    if (!subcategoryDeleteModal) return;
    const { subcategoryId } = subcategoryDeleteModal;
    const success = await executeAction(
      `subcategory:delete:${subcategoryId}`,
      'Subcategoria eliminada correctamente.',
      () => removeSubcategory(subcategoryId),
    );
    if (success) setSubcategoryDeleteModal(null);
  };

  const openCategoryDeleteImpactModal = async (
    categoryId: string,
    categoryName: string,
  ) => {
    setActionFeedback(null);
    clearError();
    setCategoryDeleteImpactModal({
      categoryId,
      categoryName,
      impact: null,
      loading: true,
      error: null,
    });

    try {
      const impact = await getCategoryDeleteImpact(categoryId);
      setCategoryDeleteImpactModal((prev) =>
        prev && prev.categoryId === categoryId
          ? {
              ...prev,
              impact,
              loading: false,
              error: null,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo calcular el impacto de eliminacion de la categoria.';
      setCategoryDeleteImpactModal((prev) =>
        prev && prev.categoryId === categoryId
          ? {
              ...prev,
              loading: false,
              error: message,
            }
          : prev,
      );
    }
  };

  const closeCategoryDeleteImpactModal = () => {
    if (
      categoryDeleteImpactModal &&
      pendingAction === `category:delete:${categoryDeleteImpactModal.categoryId}`
    ) {
      return;
    }
    setCategoryDeleteImpactModal(null);
    setCategoryDeleteConfirmText('');
  };

  const confirmDeleteCategory = async () => {
    if (!categoryDeleteImpactModal) {
      return;
    }

    const { categoryId } = categoryDeleteImpactModal;
    const success = await executeAction(
      `category:delete:${categoryId}`,
      'Categoria eliminada correctamente.',
      () => removeCategory(categoryId),
    );

    if (success) {
      if (categoryModalMode === 'edit' && categoryModalTargetId === categoryId) {
        closeCategoryModal();
      }
      if (expandedCategoryId === categoryId) {
        setExpandedCategoryId(null);
      }
      setCategoryDeleteImpactModal(null);
      setCategoryDeleteConfirmText('');
    }
  };

  return {
    actionFeedback,
    categoryItems: categories,
    subcategoriesByCategoryId,
    expandedCategoryId,
    setExpandedCategoryId,
    openCreateCategoryModal,
    openEditCategoryModal,
    openCategoryDeleteImpactModal,
    openCreateSubcategoryModal,
    openEditSubcategoryModal,
    openSubcategoryDeleteModal,
    categoryModalMode,
    closeCategoryModal,
    categoryForm,
    setCategoryForm,
    handleSubmitCategoryModal,
    subcategoryModalMode,
    closeSubcategoryModal,
    subcategoryForm,
    setSubcategoryForm,
    handleSubmitSubcategoryModal,
    subcategoryDeleteModal,
    closeSubcategoryDeleteModal,
    confirmDeleteSubcategory,
    categoryDeleteImpactModal,
    closeCategoryDeleteImpactModal,
    categoryDeleteConfirmText,
    setCategoryDeleteConfirmText,
    confirmDeleteCategory,
    pendingAction,
  };
};

