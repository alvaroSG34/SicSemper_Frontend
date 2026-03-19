import { describe, expect, it } from 'vitest';
import {
  mapApiCategoryDeleteImpact,
  mapApiCategoryToCatalogCategory,
  mapCreateCategoryPayloadToApiRequest,
  mapCreateSubcategoryPayloadToApiRequest,
  mapEventCategoryLinkToApiRequest,
  mapUpdateCategoryPayloadToApiRequest,
  mapUpdateSubcategoryPayloadToApiRequest,
} from './admin-categories.mapper';

describe('admin-categories.mapper', () => {
  it('maps api category to catalog category', () => {
    const result = mapApiCategoryToCatalogCategory(
      {
        id: 'cat-1',
        name: 'Senior',
        parentId: null,
        parent: null,
        childCount: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
      'evt-1',
    );

    expect(result).toEqual({
      id: 'cat-1',
      eventId: 'evt-1',
      name: 'Senior',
      parentId: null,
    });
  });

  it('maps delete impact', () => {
    const result = mapApiCategoryDeleteImpact({
      categoryId: 'cat-1',
      categoryName: 'Senior',
      children: 2,
      eventCategories: 3,
      judgeAssignments: 4,
      registrations: 5,
      models: 6,
    });

    expect(result.children).toBe(2);
    expect(result.models).toBe(6);
  });

  it('maps create/update category payloads', () => {
    expect(
      mapCreateCategoryPayloadToApiRequest({ name: 'Senior', eventId: null }),
    ).toEqual({ name: 'Senior' });

    expect(
      mapUpdateCategoryPayloadToApiRequest({
        id: 'cat-1',
        name: 'Senior',
        eventId: null,
      }),
    ).toEqual({ name: 'Senior' });
  });

  it('maps subcategory payloads and event-category link', () => {
    expect(
      mapCreateSubcategoryPayloadToApiRequest({
        categoryId: 'cat-1',
        name: 'Junior',
      }),
    ).toEqual({ name: 'Junior', parentId: 'cat-1' });

    expect(
      mapUpdateSubcategoryPayloadToApiRequest({
        id: 'sub-1',
        categoryId: 'cat-1',
        name: 'Junior',
      }),
    ).toEqual({ name: 'Junior', parentId: 'cat-1' });

    expect(mapEventCategoryLinkToApiRequest('evt-1', 'cat-1')).toEqual({
      eventId: 'evt-1',
      categoryId: 'cat-1',
    });
  });
});
