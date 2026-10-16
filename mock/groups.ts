import { Group, GroupDetail } from '@/types';

export const mockGroups: Group[] = [
  { conversID: "1", groupName: 'Famille Dupont', groupPhoto: '', lastMessage: 'Bon anniversaire ! 🎂', lastMessageAt: '2026-05-26T10:30:00Z', members: 8, createdAt: '2025-01-20T14:00:00Z' },
  { conversID: "2", groupName: 'Collègues Dev', groupPhoto: '', lastMessage: 'PR mergé ✅', lastMessageAt: '2026-05-26T09:15:00Z', members: 12, createdAt: '2025-02-15T09:00:00Z' },
  { conversID: "3", groupName: 'Amis de Fac', groupPhoto: '', lastMessage: 'Ce soir bière ? 🍺', lastMessageAt: '2026-05-25T22:00:00Z', members: 6, createdAt: '2025-03-01T18:30:00Z' },
  { conversID: "4", groupName: 'Club de Sport', groupPhoto: '', lastMessage: 'Match samedi 15h', lastMessageAt: '2026-05-25T16:45:00Z', members: 15, createdAt: '2025-04-10T10:00:00Z' },
  { conversID: "5", groupName: 'Voyage Maroc', groupPhoto: '', lastMessage: 'Photos de Marrakech 📸', lastMessageAt: '2026-05-24T20:00:00Z', members: 4, createdAt: '2025-05-05T12:00:00Z' },
  { conversID: "6", groupName: 'Projet Alanya', groupPhoto: '', lastMessage: 'Sprint review demain', lastMessageAt: '2026-05-24T14:30:00Z', members: 10, createdAt: '2025-06-01T08:00:00Z' },
  { conversID: "7", groupName: 'Voisins', groupPhoto: '', lastMessage: 'Fête des voisins ce WE', lastMessageAt: '2026-05-23T19:00:00Z', members: 7, createdAt: '2025-07-15T16:00:00Z' },
  { conversID: "8", groupName: 'Gaming Squad', groupPhoto: '', lastMessage: 'Rank up ! 🔥', lastMessageAt: '2026-05-23T01:00:00Z', members: 5, createdAt: '2025-08-20T22:00:00Z' },
  { conversID: "9", groupName: 'Cours de Yoga', groupPhoto: '', lastMessage: 'Séance annulée', lastMessageAt: '2026-05-22T08:00:00Z', members: 20, createdAt: '2025-09-01T07:00:00Z' },
  { conversID: "10", groupName: 'Book Club', groupPhoto: '', lastMessage: 'Prochain livre : Dune', lastMessageAt: '2026-05-21T15:00:00Z', members: 9, createdAt: '2025-10-10T20:00:00Z' },
];

const _MOCK_NAMES: [string, string][] = [
  ['Jean Dupont', 'jeand'], ['Marie K.', 'mariek'], ['Paul B.', 'paulb'],
  ['Sophie L.', 'sophiel'], ['Lucas M.', 'lucasm'], ['Emma R.', 'emmar'],
  ['Thomas W.', 'thomasw'], ['Camille N.', 'camillen'],
];

export function mockGroupDetail(id: string): GroupDetail {
  const g = mockGroups.find((x) => x.conversID === id) || mockGroups[0];
  const n = Math.min(g.members, _MOCK_NAMES.length);
  const members = Array.from({ length: n }, (_, i) => ({
    alanyaID: String(i + 1),
    nom: _MOCK_NAMES[i][0],
    pseudo: _MOCK_NAMES[i][1],
    avatarUrl: null,
    alanyaPhone: `+33 6 12 34 56 7${i}`,
    isOnline: i % 2 === 0,
    lastSeen: '2026-05-26T10:00:00Z',
    typeCompte: i === 0 ? 1 : 0,
    joinedAt: g.createdAt,
  }));
  return {
    conversID: g.conversID,
    groupName: g.groupName,
    groupPhoto: g.groupPhoto || null,
    lastMessage: g.lastMessage || null,
    lastMessageAt: g.lastMessageAt,
    memberCount: g.members,
    messageCount: 128,
    createdAt: g.createdAt,
    members,
  };
}
