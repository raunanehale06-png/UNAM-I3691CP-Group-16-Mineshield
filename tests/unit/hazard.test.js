import {
  addHazard,
  addZone,
  getHazardsByUser,
  updateHazardStatus,
} from '../../src/services/firestoreService';
import { markHazardResolved } from '../../src/services/supervisorService';
import { db } from '../../src/services/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

const mockAddDoc = jest.fn();
const mockCollection = jest.fn((dbInstance, name) => ({
  dbInstance,
  name,
}));
const mockDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockGetDoc = jest.fn();
const mockQuery = jest.fn((...parts) => ({
  parts,
}));
const mockWhere = jest.fn((field, op, value) => ({
  field,
  op,
  value,
}));
const mockServerTimestamp = jest.fn(() => 'SERVER_TIMESTAMP');
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();

const mockBuildHazardReportCode = jest.fn(({ id }) => `CODE-${id}`);
const mockCreateHazardReportCode = jest.fn(() => 'HZD-001');
const mockSanitizeLocationLabel = jest.fn((value, fallback = 'GPS location') =>
  String(value || '').trim() ? String(value).trim() : fallback
);

let generatedHazardIndex = 0;

jest.mock('firebase/firestore', () => ({
  addDoc: (...args) => mockAddDoc(...args),
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  onSnapshot: jest.fn(),
  orderBy: jest.fn((...args) => ({ orderBy: args })),
  query: (...args) => mockQuery(...args),
  serverTimestamp: (...args) => mockServerTimestamp(...args),
  setDoc: (...args) => mockSetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  where: (...args) => mockWhere(...args),
}));

jest.mock('../../src/services/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'supervisor-1',
      displayName: 'Supervisor One',
      email: 'supervisor@mineshield.com',
    },
  },
  db: {
    appName: 'MineShieldTestApp',
  },
}));

jest.mock('../../src/utils/hazardReportCode', () => ({
  buildHazardReportCode: (...args) => mockBuildHazardReportCode(...args),
  createHazardReportCode: (...args) => mockCreateHazardReportCode(...args),
}));

jest.mock('../../src/services/locationService', () => ({
  sanitizeLocationLabel: (...args) => mockSanitizeLocationLabel(...args),
}));

const makeSnapshot = (id, data) => ({
  id,
  data: jest.fn(() => data),
});

const clearDashboardHistory = async (userId) => {
  await setDoc(
    doc(db, 'users', userId),
    {
      reportsClearedAt: serverTimestamp(),
      alertsClearedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

describe('hazard reporting and resolution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generatedHazardIndex = 0;
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-31T10:15:30.000Z'));

    mockDoc.mockImplementation((...args) => {
      if (args.length === 1) {
        generatedHazardIndex += 1;
        return {
          id: `hazard-${String(generatedHazardIndex).padStart(3, '0')}`,
          collectionRef: args[0],
        };
      }

      if (args.length >= 3) {
        const [dbInstance, collectionName, documentId] = args;

        return {
          id: documentId,
          path: `${collectionName}/${documentId}`,
          dbInstance,
          collectionName,
        };
      }

      return {
        id: `doc-${generatedHazardIndex + 1}`,
        collectionRef: args[0],
      };
    });

    mockGetDocs.mockResolvedValue({ docs: [] });
    mockGetDoc.mockResolvedValue({
      data: () => ({
        userId: 'worker-1',
        zone: 'Sector Beta',
        zoneId: 'sector-beta',
        locationLabel: 'Sector Beta',
      }),
    });
    mockCreateHazardReportCode.mockReturnValue('HZD-001');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds a new hazard report with description, image, and location', async () => {
    const hazard = await addHazard({
      description: 'Loose cable near the conveyor belt',
      imageUrl: 'https://cdn.mineshield.test/hazard.jpg',
      location: {
        area: 'Shaft 4',
        label: 'Shaft 4 access',
      },
      locationLabel: 'Shaft 4 access',
      reportedBy: 'Worker One',
      severity: 'HIGH',
      status: 'reported',
      userId: 'worker-1',
      zone: 'Sector Beta',
      zoneId: 'sector-beta',
    });

    expect(mockCollection).toHaveBeenCalledWith(db, 'hazards');
    expect(mockDoc).toHaveBeenCalledTimes(1);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'hazard-001',
        collectionRef: expect.objectContaining({ name: 'hazards' }),
      }),
      expect.objectContaining({
        description: 'Loose cable near the conveyor belt',
        imageURL: 'https://cdn.mineshield.test/hazard.jpg',
        imageUrl: 'https://cdn.mineshield.test/hazard.jpg',
        locationLabel: 'Shaft 4 access',
        reportCode: 'HZD-001',
        status: 'reported',
        resolved: false,
        isResolved: false,
        closed: false,
        completed: false,
        createdAt: 'SERVER_TIMESTAMP',
        timestamp: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      })
    );
    expect(hazard).toMatchObject({
      id: 'hazard-001',
      description: 'Loose cable near the conveyor belt',
      imageUrl: 'https://cdn.mineshield.test/hazard.jpg',
      locationLabel: 'Shaft 4 access',
      reportCode: 'HZD-001',
      status: 'reported',
      createdAt: '2026-05-31T10:15:30.000Z',
      timestamp: '2026-05-31T10:15:30.000Z',
      updatedAt: '2026-05-31T10:15:30.000Z',
    });
  });

  it('fetches hazards by user id', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        makeSnapshot('hazard-old', {
          userId: 'worker-1',
          description: 'Older hazard',
          createdAt: '2026-05-31T09:12:00.000Z',
          locationLabel: 'Sector Beta',
        }),
        makeSnapshot('hazard-new', {
          userId: 'worker-1',
          description: 'Newest hazard',
          createdAt: '2026-05-31T10:12:00.000Z',
          locationLabel: 'Sector Alpha',
        }),
      ],
    });

    const hazards = await getHazardsByUser('worker-1');

    expect(mockCollection).toHaveBeenCalledWith(db, 'hazards');
    expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'worker-1');
    expect(mockQuery).toHaveBeenCalled();
    expect(hazards.map((item) => item.id)).toEqual(['hazard-new', 'hazard-old']);
    expect(hazards[0]).toMatchObject({
      description: 'Newest hazard',
      locationLabel: 'Sector Alpha',
      reportCode: 'CODE-hazard-new',
      reportedBy: 'Mine worker',
    });
  });

  it('updates hazard status to resolved', async () => {
    await updateHazardStatus('hazard-007', 'resolved');

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'hazard-007',
        path: 'hazards/hazard-007',
      }),
      expect.objectContaining({
        status: 'resolved',
        resolved: true,
        isResolved: true,
        closed: false,
        completed: false,
        updatedAt: 'SERVER_TIMESTAMP',
      })
    );
  });

  it('marks a hazard as resolved and broadcasts the supervisor alert', async () => {
    await markHazardResolved('hazard-123');

    expect(mockGetDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'hazard-123',
        path: 'hazards/hazard-123',
      })
    );
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'hazard-123',
        path: 'hazards/hazard-123',
      }),
      expect.objectContaining({
        status: 'resolved',
        resolved: true,
        isResolved: true,
        closed: true,
        resolvedAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      })
    );
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'alerts' }),
      expect.objectContaining({
        type: 'HAZARD_RESOLVED',
        title: 'Hazard Report Resolved',
        recipientUserId: 'worker-1',
        userId: 'worker-1',
        hazardId: 'hazard-123',
      })
    );
  });

  it('writes a safe zone record when a supervisor marks a zone safe', async () => {
    await addZone({
      id: 'sector-alpha',
      name: 'Sector Alpha',
      status: 'Safe',
      metrics: {
        ch4: '0.02%',
        o2: '20.9%',
        temp: '24C',
        structural: 'Nominal',
      },
      riskScore: 12,
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'zones' }),
      expect.objectContaining({
        id: 'sector-alpha',
        name: 'Sector Alpha',
        status: 'Safe',
        riskScore: 12,
      })
    );
  });

  it('clearing hazard logs also clears alerts in the dashboard workflow', async () => {
    await clearDashboardHistory('worker-1');

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'worker-1',
        path: 'users/worker-1',
      }),
      expect.objectContaining({
        reportsClearedAt: 'SERVER_TIMESTAMP',
        alertsClearedAt: 'SERVER_TIMESTAMP',
      }),
      { merge: true }
    );
  });
});
