export const mockBatches = [
  { id: 'SILAGE-001', type: 'Silage', feedType: 'Maize Silage', createdOn: '20 May 2026', analyses: 4, analysesCount: 4, averageScore: 87, status: 'Active', storage: 'Covered Pit' },
  { id: 'SILAGE-002', type: 'Silage', feedType: 'Grass Silage', createdOn: '19 May 2026', analyses: 3, analysesCount: 3, averageScore: 68, status: 'Caution', storage: 'Silo Bag' },
  { id: 'FEED-001', type: 'Feed', feedType: 'Cattle Feed Pellet', createdOn: '18 May 2026', analyses: 2, analysesCount: 2, averageScore: 82, status: 'Active', storage: 'Covered Warehouse' },
  { id: 'SILAGE-003', type: 'Silage', feedType: 'Maize Silage', createdOn: '16 May 2026', analyses: 5, analysesCount: 5, averageScore: 44, status: 'High Risk', storage: 'Open Stack' },
  { id: 'FEED-002', type: 'Feed', feedType: 'Dairy Concentrate', createdOn: '15 May 2026', analyses: 2, analysesCount: 2, averageScore: 76, status: 'Active', storage: 'Covered Warehouse' }
]
export const mockTests = [
  { id: 'SF-2026-1256', batchId: 'SILAGE-001', type: 'Silage', analyzedOn: '22 May 2026, 10:30 AM', score: 87, risk: 'Good', sampleType: 'Silage' },
  { id: 'SF-2026-1255', batchId: 'FEED-001', type: 'Feed', analyzedOn: '21 May 2026, 09:20 AM', score: 82, risk: 'Good', sampleType: 'Feed' },
  { id: 'SF-2026-1254', batchId: 'SILAGE-002', type: 'Silage', analyzedOn: '20 May 2026, 04:10 PM', score: 68, risk: 'Caution', sampleType: 'Silage' },
  { id: 'SF-2026-1253', batchId: 'SILAGE-003', type: 'Silage', analyzedOn: '19 May 2026, 02:15 PM', score: 44, risk: 'High Risk', sampleType: 'Silage' },
  { id: 'SF-2026-1252', batchId: 'FEED-002', type: 'Feed', analyzedOn: '18 May 2026, 11:05 AM', score: 76, risk: 'Good', sampleType: 'Feed' },
  { id: 'SF-2026-1251', batchId: 'SILAGE-001', type: 'Silage', analyzedOn: '17 May 2026, 08:40 AM', score: 72, risk: 'Caution', sampleType: 'Silage' }
]
export const mockReports = [
  { id: 'RPT-2026-032', type: 'Sample Report', date: '22 May 2026, 10:30 AM', ref: 'SF-2026-1256' },
  { id: 'RPT-2026-031', type: 'Batch Report', date: '21 May 2026, 09:00 AM', ref: 'SILAGE-001' },
  { id: 'RPT-2026-030', type: 'Sample Report', date: '20 May 2026, 04:20 PM', ref: 'SF-2026-1254' }
]
export const trendData = { '7 days': [87, 82, 76, 68, 81], '30 days': [72, 78, 75, 82, 76, 87, 81], '90 days': [64, 72, 68, 78, 74, 82, 87, 81, 76] }
export const resultParameters = [
  ['Crude Protein', '14.2', '%', 'Good'], ['Moisture', '58', '%', 'Good'], ['Fiber', '28.4', '%', 'Good'], ['Energy Value', '8.5', 'MJ/kg', 'Good'], ['Mineral Status', 'Balanced', '', 'Good'], ['Adulteration', 'Not detected', '', 'Good'], ['Aflatoxin Level', '4', 'ppb', 'Good']
]
