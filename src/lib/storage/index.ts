// Flip this flag to 'firebase' when you want cloud sync
const MODE: 'mock' | 'firebase' = 'mock';
export * from (MODE === 'firebase' ? './firebase' : './mock');
