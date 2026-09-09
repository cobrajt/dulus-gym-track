/* Capa de persistencia local. Mantiene los datos de la PWA sin depender de red. */
const DulusStorage = (() => {
  const DB_NAME = 'dulus-gym-track';
  const DB_VERSION = 1;
  const STORES = {
    students: 'students',
    settings: 'settings',
    meta: 'meta',
    workouts: 'workouts',
    exerciseLibrary: 'exerciseLibrary',
    nutrition: 'nutrition',
    community: 'community'
  };
  let databasePromise;

  const open = () => {
    if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB no está disponible'));
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORES.students)) db.createObjectStore(STORES.students, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORES.settings)) db.createObjectStore(STORES.settings, { keyPath: 'key' });
        if (!db.objectStoreNames.contains(STORES.meta)) db.createObjectStore(STORES.meta, { keyPath: 'key' });
        [STORES.workouts, STORES.exerciseLibrary, STORES.nutrition, STORES.community].forEach(name => {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB'));
      request.onblocked = () => reject(new Error('La base de datos está bloqueada'));
    });
    return databasePromise;
  };

  const run = async (storeName, mode, action) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const request = action(transaction.objectStore(storeName));
      let result;
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error || new Error(`Error en ${storeName}`));
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error(`Transacción fallida en ${storeName}`));
    });
  };

  return {
    stores: STORES,
    getStudents: () => run(STORES.students, 'readonly', store => store.getAll()),
    saveStudent: student => run(STORES.students, 'readwrite', store => store.put(student)),
    getSetting: key => run(STORES.settings, 'readonly', store => store.get(key)).then(record => record?.value),
    saveSetting: (key, value) => run(STORES.settings, 'readwrite', store => store.put({ key, value })),
    getMeta: key => run(STORES.meta, 'readonly', store => store.get(key)).then(record => record?.value),
    saveMeta: (key, value) => run(STORES.meta, 'readwrite', store => store.put({ key, value })),
    getWorkouts: () => run(STORES.workouts, 'readonly', store => store.getAll()),
    saveWorkout: workout => run(STORES.workouts, 'readwrite', store => store.put(workout))
  };
})();
