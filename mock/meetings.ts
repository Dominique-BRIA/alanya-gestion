import { Meeting } from '@/types';

export const mockMeetings: Meeting[] = [
  { idMeeting: 1, idOrganiser: "4", organiserNom: 'Sophie L.', organiserPseudo: 'sophiel', organiserAvatar: '', objet: 'Sprint Planning', room: 'room-abc-123', startTime: '2026-05-26T10:00:00Z', duree: 60, isEnd: 1, typeMedia: 1, participants: 6, createdAt: '2026-05-26T09:00:00Z' },
  { idMeeting: 2, idOrganiser: "1", organiserNom: 'Jean Dupont', organiserPseudo: 'jeand', organiserAvatar: '', objet: 'Point hebdomadaire', room: 'room-def-456', startTime: '2026-05-26T14:00:00Z', duree: 30, isEnd: 1, typeMedia: 0, participants: 4, createdAt: '2026-05-26T08:00:00Z' },
  { idMeeting: 3, idOrganiser: "6", organiserNom: 'Emma R.', organiserPseudo: 'emmar', organiserAvatar: '', objet: 'Réunion clients', room: 'room-ghi-789', startTime: '2026-05-25T11:00:00Z', duree: 45, isEnd: 1, typeMedia: 1, participants: 8, createdAt: '2026-05-24T16:00:00Z' },
  { idMeeting: 4, idOrganiser: "2", organiserNom: 'Marie K.', organiserPseudo: 'mariek', organiserAvatar: '', objet: 'Daily standup', room: 'room-jkl-012', startTime: '2026-05-25T09:30:00Z', duree: 15, isEnd: 1, typeMedia: 0, participants: 5, createdAt: '2026-05-25T08:00:00Z' },
  { idMeeting: 5, idOrganiser: "10", organiserNom: 'Léa D.', organiserPseudo: 'lead', organiserAvatar: '', objet: 'Brainstorming features', room: 'room-mno-345', startTime: '2026-05-24T15:00:00Z', duree: 90, isEnd: 0, typeMedia: 1, participants: 3, createdAt: '2026-05-23T12:00:00Z' },
  { idMeeting: 6, idOrganiser: "7", organiserNom: 'Thomas W.', organiserPseudo: 'thomasw', organiserAvatar: '', objet: 'Code review', room: 'room-pqr-678', startTime: '2026-05-24T10:00:00Z', duree: 60, isEnd: 1, typeMedia: 1, participants: 4, createdAt: '2026-05-23T09:00:00Z' },
  { idMeeting: 7, idOrganiser: "3", organiserNom: 'Paul B.', organiserPseudo: 'paulb', organiserAvatar: '', objet: 'Réunion famille', room: 'room-stu-901', startTime: '2026-05-23T18:00:00Z', duree: 120, isEnd: 1, typeMedia: 1, participants: 10, createdAt: '2026-05-22T20:00:00Z' },
  { idMeeting: 8, idOrganiser: "9", organiserNom: 'Hugo P.', organiserPseudo: 'hugop', organiserAvatar: '', objet: 'Formation onboarding', room: 'room-vwx-234', startTime: '2026-05-23T08:00:00Z', duree: 180, isEnd: 1, typeMedia: 1, participants: 15, createdAt: '2026-05-20T10:00:00Z' },
];
