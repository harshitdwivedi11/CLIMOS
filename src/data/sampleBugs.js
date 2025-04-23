export const sampleBugs = [
  {
    id: 1,
    title: 'Login page crashes on mobile devices',
    description: 'Users report that the login page crashes when accessed from mobile devices with iOS 15.',
    severity: 'High',
    sessionAvailable: true,
    status: 'Open'
  },
  {
    id: 2,
    title: 'Payment processing timeout',
    description: 'Customers experience timeouts when trying to complete payments during peak hours.',
    severity: 'Critical',
    sessionAvailable: true,
    status: 'In Progress'
  },
  {
    id: 3,
    title: 'Profile image upload fails',
    description: 'Users cannot upload profile images larger than 1MB, although the documented limit is 5MB.',
    severity: 'Medium',
    sessionAvailable: true,
    status: 'Open'
  },
  {
    id: 4,
    title: 'Dashboard data not refreshing',
    description: 'Real-time dashboard data stops updating after approximately 30 minutes of activity.',
    severity: 'Medium',
    sessionAvailable: true,
    status: 'Open'
  },
  {
    id: 5,
    title: 'Search results inconsistent',
    description: 'Search functionality returns different results for the same query when performed in quick succession.',
    severity: 'Low',
    sessionAvailable: true,
    status: 'Resolved'
  }
] 