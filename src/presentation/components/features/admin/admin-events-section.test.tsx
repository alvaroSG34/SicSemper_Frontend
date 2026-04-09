import { fireEvent, render, screen } from '@testing-library/react';
import type {
  AdminClub,
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  EventCategoryOption,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import type { User } from '@/domain/user/user.types';
import { AdminEventsSection } from './admin-events-section';

const mockUseAdminEvents = vi.fn();
const mockUseAdminJudgeAssignments = vi.fn();

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('./use-admin-events', () => ({
  useAdminEvents: (...args: unknown[]) => mockUseAdminEvents(...args),
}));

vi.mock('./use-admin-judge-assignments', () => ({
  useAdminJudgeAssignments: (...args: unknown[]) => mockUseAdminJudgeAssignments(...args),
}));

vi.mock('./judge-event-assignment-board', () => ({
  JudgeEventAssignmentBoard: () => <div>Mock Judge Board</div>,
}));

const events: CatalogEvent[] = [
  {
    id: 'event-1',
    name: 'Evento Modal QA',
    organizerClubId: 'club-1',
    status: 'ACTIVO',
    place: 'La Paz',
    startDate: '2026-05-10',
    endDate: '2026-05-11',
    description: 'Descripcion',
  },
];

const clubs: AdminClub[] = [
  {
    id: 'club-1',
    name: 'Club Central',
    place: 'La Paz',
    contactEmail: 'club@example.com',
    members: 10,
  },
];

const categories: CatalogCategory[] = [];
const subcategories: CatalogSubcategory[] = [];
const eventCategories: EventCategoryOption[] = [];
const users: User[] = [];
const assignments: JudgeAssignmentScope[] = [];

const buildAdminEventsHookReturn = () => ({
  actionFeedback: null,
  filteredEvents: events,
  eventSearch: '',
  setEventSearch: vi.fn(),
  eventStatusFilter: 'TODOS' as const,
  setEventStatusFilter: vi.fn(),
  eventStatusOptions: ['ACTIVO', 'PAUSADO', 'BORRADOR'] as const,
  openCreateEventModal: vi.fn(),
  openEditEventModal: vi.fn(),
  eventModalMode: null,
  eventModalStep: 1 as const,
  setEventModalStep: vi.fn(),
  eventModalSelectedCategoryIds: new Set<string>(),
  toggleCategorySelection: vi.fn(),
  eventModalError: null,
  eventForm: {
    organizerClubId: 'club-1',
    name: '',
    place: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVO' as const,
    imageUrl: '',
    description: '',
  },
  setEventForm: vi.fn(),
  eventImageFileInputRef: { current: null },
  isEventImageUploading: false,
  handleEventImageFileChange: vi.fn(),
  handleSubmitEventModal: vi.fn(),
  isEventModalPending: false,
  eventModalCategoryRemovalImpact: {
    removedEventCategoryIds: [],
    removedAssignmentsCount: 0,
  },
  handleFinalizeEventModal: vi.fn(),
  closeEventModal: vi.fn(),
  categoryItems: [],
  subcategoriesByCategoryId: new Map<string, CatalogSubcategory[]>(),
  pendingAction: null,
  eventDeleteImpactModal: null,
  openEventDeleteImpactModal: vi.fn(),
  closeEventDeleteImpactModal: vi.fn(),
  confirmDeleteEvent: vi.fn(),
});

const buildAdminJudgeAssignmentsHookReturn = () => ({
  selectedEventId: 'event-1',
  setSelectedEventId: vi.fn(),
  eligibleJudges: [],
  selectedCategoryNodes: [],
  assignedJudgeIds: new Set<string>(),
  judgeSubcategoryDraft: {},
  setJudgeSubcategoryDraft: vi.fn(),
  assignJudgeToEventDraft: vi.fn(),
  unassignJudgeFromEventDraft: vi.fn(),
  judgeValidationIssues: [],
  pendingAssignmentAction: null,
  assignmentFeedback: null,
  handleSaveAssignments: vi.fn(),
});

const renderSection = (canReadJudgeAssignments = true) =>
  render(
    <AdminEventsSection
      events={events}
      clubs={clubs}
      categories={categories}
      subcategories={subcategories}
      eventCategories={eventCategories}
      users={users}
      assignments={assignments}
      headingClassName="heading"
      canCreateEvents
      canUpdateEvents
      canDeleteEvents
      canReadJudgeAssignments={canReadJudgeAssignments}
      canManageJudgeAssignments
    />,
  );

describe('AdminEventsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminEvents.mockReturnValue(buildAdminEventsHookReturn());
    mockUseAdminJudgeAssignments.mockReturnValue(buildAdminJudgeAssignmentsHookReturn());
  });

  it('hides judge manager by default, opens modal on click and closes with close button', () => {
    renderSection(true);

    expect(screen.queryByText('Gestionar jueces por evento')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Gestionar jueces' }));

    expect(screen.getByText('Gestionar jueces por evento')).toBeTruthy();
    expect(screen.getAllByText('Evento Modal QA').length).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByText('Gestionar jueces por evento')).toBeNull();
  });

  it('does not render judge manager controls when assignment read permission is disabled', () => {
    renderSection(false);

    expect(screen.queryByRole('button', { name: 'Gestionar jueces' })).toBeNull();
    expect(screen.queryByText('Gestionar jueces por evento')).toBeNull();
  });
});
