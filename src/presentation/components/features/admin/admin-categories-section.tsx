import type { CatalogCategory, CatalogSubcategory } from '@/domain/admin/admin.types';
import { useAdminCategories } from './use-admin-categories';

type AdminCategoriesSectionProps = {
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  headingClassName: string;
  loading?: boolean;
  canCreateCategories: boolean;
  canUpdateCategories: boolean;
  canDeleteCategories: boolean;
};

export function AdminCategoriesSection({
  categories,
  subcategories,
  headingClassName,
  loading = false,
  canCreateCategories,
  canUpdateCategories,
  canDeleteCategories,
}: AdminCategoriesSectionProps) {
  const {
    actionFeedback,
    categoryItems,
    subcategoriesByParentId,
    expandedNodeIds,
    toggleNodeExpanded,
    openCreateCategoryModal,
    openEditCategoryModal,
    openCategoryDeleteImpactModal,
    openCreateSubcategoryModal,
    openEditSubcategoryModal,
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
    categoryDeleteImpactModal,
    closeCategoryDeleteImpactModal,
    categoryDeleteConfirmText,
    setCategoryDeleteConfirmText,
    confirmDeleteCategory,
    pendingAction,
  } = useAdminCategories({
    categories,
    subcategories,
  });

  const renderChildNodes = (parentId: string, depth: 2 | 3) => {
    const children = subcategoriesByParentId.get(parentId) ?? [];

    if (children.length === 0) {
      return null;
    }

    return (
      <ul className="mt-2 space-y-2">
        {children.map((node) => {
          const childNodes = subcategoriesByParentId.get(node.id) ?? [];
          const hasChildren = childNodes.length > 0;
          const isExpanded = expandedNodeIds.has(node.id);
          const isDeleting = pendingAction === `category:delete:${node.id}`;
          const canCreateChild = depth < 3;

          return (
            <li
              key={node.id}
              className="rounded-md border border-[#2D2D2D] bg-[#121212] px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{node.name}</p>
                  <p className="text-[11px] text-[#9C9C9C]">Nivel {depth}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleNodeExpanded(node.id)}
                      className="inline-flex h-7 items-center justify-center rounded-md border border-[#2D2D2D] px-2 text-[11px] font-semibold text-white"
                    >
                      {isExpanded ? 'Ocultar hijas' : `Ver hijas (${childNodes.length})`}
                    </button>
                  ) : null}
                  {canCreateChild && canCreateCategories ? (
                    <button
                      type="button"
                      disabled={loading || isDeleting}
                      onClick={() => openCreateSubcategoryModal(node.id)}
                      className="inline-flex h-7 items-center justify-center rounded-md bg-[#5B68F1] px-2 text-[11px] font-semibold text-white"
                    >
                      + Añadir
                    </button>
                  ) : null}
                  {canUpdateCategories ? (
                    <button
                      type="button"
                      disabled={loading || isDeleting}
                      onClick={() => openEditSubcategoryModal(node)}
                      className="inline-flex h-7 items-center justify-center rounded-md border border-[#2D2D2D] px-2 text-[11px] font-semibold text-white"
                    >
                      Editar
                    </button>
                  ) : null}
                  {canDeleteCategories ? (
                    <button
                      type="button"
                      disabled={loading || isDeleting}
                      onClick={() =>
                        void openCategoryDeleteImpactModal(node.id, node.name)
                      }
                      className="inline-flex h-7 items-center justify-center rounded-md bg-[#4B1F2A] px-2 text-[11px] font-semibold text-white"
                    >
                      {isDeleting ? '...' : 'Eliminar'}
                    </button>
                  ) : null}
                </div>
              </div>

              {isExpanded && hasChildren ? (
                <div className="pl-3">{renderChildNodes(node.id, 3)}</div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <section id="categorias" className="grid w-full grid-cols-1 gap-5">
        <article className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6 xl:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className={`${headingClassName} text-[20px] font-semibold text-white`}>
              Categorias
            </h3>
            {canCreateCategories ? (
              <button
                type="button"
                onClick={openCreateCategoryModal}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-xs font-semibold text-white"
              >
                Crear categoria raiz
              </button>
            ) : null}
          </div>

          {actionFeedback ? (
            <p
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                actionFeedback.type === 'success'
                  ? 'border-[#14532d] bg-[#052e16] text-[#86efac]'
                  : 'border-[#7f1d1d] bg-[#7f1d1d]/20 text-[#fca5a5]'
              }`}
            >
              {actionFeedback.message}
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
            {categoryItems.map((item) => {
              const childNodes = subcategoriesByParentId.get(item.id) ?? [];
              const isDeleting = pendingAction === `category:delete:${item.id}`;
              const isExpanded = expandedNodeIds.has(item.id);

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4"
                >
                  <div className="md:flex md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-[#9C9C9C]">Nivel 1</p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
                      <button
                        type="button"
                        onClick={() => toggleNodeExpanded(item.id)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                      >
                        {isExpanded
                          ? 'Ocultar ramas'
                          : `Ver ramas (${childNodes.length})`}
                      </button>
                      {canCreateCategories ? (
                        <button
                          type="button"
                          disabled={loading || isDeleting}
                          onClick={() => openCreateSubcategoryModal(item.id)}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#5B68F1] px-3 text-xs font-semibold text-white"
                        >
                          + Añadir
                        </button>
                      ) : null}
                      {canUpdateCategories ? (
                        <button
                          type="button"
                          disabled={loading || isDeleting}
                          onClick={() => openEditCategoryModal(item)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2D2D2D] px-3 text-xs font-semibold text-white"
                        >
                          Editar
                        </button>
                      ) : null}
                      {canDeleteCategories ? (
                        <button
                          type="button"
                          disabled={loading || isDeleting}
                          onClick={() =>
                            void openCategoryDeleteImpactModal(item.id, item.name)
                          }
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#4B1F2A] px-3 text-xs font-semibold text-white"
                        >
                          {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-3 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-3">
                      {childNodes.length > 0 ? (
                        renderChildNodes(item.id, 2)
                      ) : (
                        <p className="text-sm text-[#9C9C9C]">
                          Esta categoria no tiene hijas. Puedes crear una categoria hija desde aqui.
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}

            {categoryItems.length === 0 ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                No hay categorias registradas.
              </p>
            ) : null}
          </div>
        </article>
      </section>

      {categoryModalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                {categoryModalMode === 'create'
                  ? 'Crear categoria raiz'
                  : 'Editar categoria raiz'}
              </h4>
              <button
                type="button"
                onClick={closeCategoryModal}
                disabled={
                  pendingAction === 'category:create' ||
                  (categoryModalMode === 'edit'
                    ? pendingAction?.startsWith('category:update:')
                    : false)
                }
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
              >
                Cerrar
              </button>
            </div>

            <form
              onSubmit={(event) => void handleSubmitCategoryModal(event)}
              className="grid gap-3"
            >
              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                Nombre
                <input
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={
                  (categoryModalMode === 'create' ? !canCreateCategories : !canUpdateCategories) ||
                  pendingAction === 'category:create' ||
                  (categoryModalMode === 'edit'
                    ? pendingAction?.startsWith('category:update:')
                    : false)
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
              >
                {pendingAction === 'category:create' ||
                (categoryModalMode === 'edit'
                  ? pendingAction?.startsWith('category:update:')
                  : false)
                  ? 'Guardando...'
                  : categoryModalMode === 'create'
                    ? 'Crear categoria raiz'
                    : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {categoryDeleteImpactModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#4B1F2A] bg-[#161616] p-5 sm:p-6">
            <div className="mb-3">
              <p className="text-xs font-semibold tracking-[1.4px] text-[#FCA5A5]">
                CONFIRMACION DE BORRADO
              </p>
              <h4 className={`${headingClassName} mt-1 text-[20px] font-semibold text-white`}>
                Eliminar categoria
              </h4>
              <p className="mt-1 text-sm text-[#BFBFBF]">
                {categoryDeleteImpactModal.categoryName}
              </p>
            </div>

            {categoryDeleteImpactModal.loading ? (
              <p className="rounded-xl border border-[#2D2D2D] bg-[#121212] px-4 py-3 text-sm text-[#9C9C9C]">
                Calculando impacto...
              </p>
            ) : null}

            {categoryDeleteImpactModal.error ? (
              <p className="rounded-xl border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
                {categoryDeleteImpactModal.error}
              </p>
            ) : null}

            {categoryDeleteImpactModal.impact ? (
              <div className="space-y-3">
                <p className="text-sm text-[#D5D5D5]">
                  Si continuas, tambien se eliminaran los siguientes datos
                  relacionados:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Categorias descendientes</p>
                    <p className="text-lg font-semibold text-white">
                      {categoryDeleteImpactModal.impact.children}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Vinculos evento-categoria</p>
                    <p className="text-lg font-semibold text-white">
                      {categoryDeleteImpactModal.impact.eventCategories}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Asignaciones de jueces</p>
                    <p className="text-lg font-semibold text-white">
                      {categoryDeleteImpactModal.impact.judgeAssignments}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3">
                    <p className="text-[11px] text-[#9C9C9C]">Inscripciones</p>
                    <p className="text-lg font-semibold text-white">
                      {categoryDeleteImpactModal.impact.registrations}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-3 sm:col-span-2">
                    <p className="text-[11px] text-[#9C9C9C]">Maquetas registradas</p>
                    <p className="text-lg font-semibold text-white">
                      {categoryDeleteImpactModal.impact.models}
                    </p>
                  </div>
                </div>
                {categoryDeleteImpactModal.impact.children > 0 ? (
                  <p className="rounded-xl border border-[#78350f] bg-[#78350f]/20 px-4 py-3 text-sm text-[#fcd34d]">
                    Tambien se eliminaran {categoryDeleteImpactModal.impact.children} categoria(s)
                    descendiente(s) y sus datos asociados.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                Escribe{' '}
                <span className="inline font-semibold tracking-widest text-white">
                  CONFIRMAR
                </span>{' '}
                para continuar
                <input
                  type="text"
                  value={categoryDeleteConfirmText}
                  onChange={(event) =>
                    setCategoryDeleteConfirmText(event.target.value)
                  }
                  placeholder="CONFIRMAR"
                  disabled={
                    pendingAction ===
                    `category:delete:${categoryDeleteImpactModal.categoryId}`
                  }
                  className="mt-1 h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none placeholder:text-[#555]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={closeCategoryDeleteImpactModal}
                  disabled={
                    pendingAction ===
                    `category:delete:${categoryDeleteImpactModal.categoryId}`
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#2D2D2D] px-4 text-sm font-semibold text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDeleteCategory()}
                  disabled={
                    !canDeleteCategories ||
                    categoryDeleteImpactModal.loading ||
                    !!categoryDeleteImpactModal.error ||
                    categoryDeleteConfirmText !== 'CONFIRMAR' ||
                    pendingAction ===
                      `category:delete:${categoryDeleteImpactModal.categoryId}`
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7f1d1d] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {pendingAction ===
                  `category:delete:${categoryDeleteImpactModal.categoryId}`
                    ? 'Eliminando...'
                    : 'Eliminar definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {subcategoryModalMode ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2D2D2D] bg-[#161616] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className={`${headingClassName} text-[20px] font-semibold text-white`}>
                {subcategoryModalMode === 'create'
                  ? 'Crear categoria hija'
                  : 'Editar categoria hija'}
              </h4>
              <button
                type="button"
                onClick={closeSubcategoryModal}
                disabled={
                  pendingAction === 'subcategory:create' ||
                  (subcategoryModalMode === 'edit'
                    ? pendingAction?.startsWith('subcategory:update:')
                    : false)
                }
                className="inline-flex h-8 items-center justify-center rounded-md border border-[#2D2D2D] px-3 text-xs font-semibold text-[#D1D1D1]"
              >
                Cerrar
              </button>
            </div>
            <form
              onSubmit={(event) => void handleSubmitSubcategoryModal(event)}
              className="grid gap-3"
            >
              <label className="flex flex-col gap-1 text-xs text-[#A8A8A8]">
                Nombre
                <input
                  value={subcategoryForm.name}
                  onChange={(event) =>
                    setSubcategoryForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
                  autoFocus
                />
              </label>
              <button
                type="submit"
                disabled={
                  (subcategoryModalMode === 'create' ? !canCreateCategories : !canUpdateCategories) ||
                  pendingAction === 'subcategory:create' ||
                  (subcategoryModalMode === 'edit'
                    ? pendingAction?.startsWith('subcategory:update:')
                    : false)
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#5B68F1] px-4 text-sm font-semibold text-white"
              >
                {pendingAction === 'subcategory:create' ||
                (subcategoryModalMode === 'edit'
                  ? pendingAction?.startsWith('subcategory:update:')
                  : false)
                  ? 'Guardando...'
                  : subcategoryModalMode === 'create'
                    ? 'Crear categoria hija'
                    : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
