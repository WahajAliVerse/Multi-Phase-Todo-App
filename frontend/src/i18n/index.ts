// Internationalization (i18n) setup for the todo application

// Define supported locales
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'ru'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

// Define translation keys
export type TranslationKey = 
  // General
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.create'
  | 'common.update'
  | 'common.search'
  | 'common.filter'
  | 'common.reset'
  | 'common.close'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  
  // Authentication
  | 'auth.login'
  | 'auth.register'
  | 'auth.logout'
  | 'auth.username'
  | 'auth.password'
  | 'auth.email'
  | 'auth.confirmPassword'
  | 'auth.forgotPassword'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.alreadyHaveAccount'
  | 'auth.createNewAccount'
  
  // Tasks
  | 'task.title'
  | 'task.description'
  | 'task.status'
  | 'task.priority'
  | 'task.dueDate'
  | 'task.createdAt'
  | 'task.updatedAt'
  | 'task.completedAt'
  | 'task.active'
  | 'task.completed'
  | 'task.low'
  | 'task.medium'
  | 'task.high'
  | 'task.create'
  | 'task.update'
  | 'task.delete'
  | 'task.complete'
  | 'task.uncomplete'
  | 'task.noTasks'
  | 'task.newTask'
  | 'task.searchPlaceholder'
  
  // Recurrence
  | 'recurrence.recurrence'
  | 'recurrence.patternType'
  | 'recurrence.daily'
  | 'recurrence.weekly'
  | 'recurrence.monthly'
  | 'recurrence.yearly'
  | 'recurrence.interval'
  | 'recurrence.repeatEvery'
  | 'recurrence.daysOfWeek'
  | 'recurrence.daysOfMonth'
  | 'recurrence.endCondition'
  | 'recurrence.never'
  | 'recurrence.afterOccurrences'
  | 'recurrence.onDate'
  | 'recurrence.occurrenceCount'
  | 'recurrence.endDate'
  | 'recurrence.preview'
  | 'recurrence.nextOccurrences'
  | 'recurrence.futureInstancesOnly'
  | 'recurrence.allInstances'
  
  // Reminders
  | 'reminder.reminder'
  | 'reminder.reminders'
  | 'reminder.add'
  | 'reminder.remove'
  | 'reminder.time'
  | 'reminder.scheduledTime'
  | 'reminder.deliveryStatus'
  | 'reminder.pending'
  | 'reminder.sent'
  | 'reminder.delivered'
  | 'reminder.failed'
  | 'reminder.snooze'
  | 'reminder.dismiss'
  | 'reminder.channel'
  | 'reminder.browser'
  | 'reminder.inApp'
  | 'reminder.email'
  
  // Tags
  | 'tag.tag'
  | 'tag.tags'
  | 'tag.tagName'
  | 'tag.color'
  | 'tag.addTag'
  | 'tag.removeTag'
  | 'tag.selectAll'
  | 'tag.selectNone'
  | 'tag.createNew'
  | 'tag.assign'
  | 'tag.unassign'
  | 'tag.filterBy'
  | 'tag.noTags'
  | 'tag.newTag'
  | 'tag.editTag'
  | 'tag.deleteTag'
  
  // Timezone
  | 'timezone.timezone'
  | 'timezone.select'
  | 'timezone.current'
  | 'timezone.useLocal'
  | 'timezone.useUTC'
  | 'timezone.offset'
  | 'timezone.gmt'
  
  // Errors
  | 'error.requiredField'
  | 'error.invalidEmail'
  | 'error.passwordMismatch'
  | 'error.networkError'
  | 'error.unauthorized'
  | 'error.notFound'
  | 'error.serverError'
  | 'error.generic'
  | 'error.invalidDate'
  | 'error.invalidTime'
  | 'error.invalidColor'
  | 'error.maxLength'
  | 'error.minLength'
  | 'error.minValue'
  | 'error.maxValue';

// Define translation structure
export interface Translations {
  [locale: string]: {
    [key in TranslationKey]?: string;
  };
}

// Default English translations
const enTranslations: Translations['en'] = {
  // General
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.update': 'Update',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.reset': 'Reset',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  
  // Authentication
  'auth.login': 'Log In',
  'auth.register': 'Register',
  'auth.logout': 'Log Out',
  'auth.username': 'Username',
  'auth.password': 'Password',
  'auth.email': 'Email',
  'auth.confirmPassword': 'Confirm Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.createNewAccount': 'Create a new account',
  
  // Tasks
  'task.title': 'Title',
  'task.description': 'Description',
  'task.status': 'Status',
  'task.priority': 'Priority',
  'task.dueDate': 'Due Date',
  'task.createdAt': 'Created At',
  'task.updatedAt': 'Updated At',
  'task.completedAt': 'Completed At',
  'task.active': 'Active',
  'task.completed': 'Completed',
  'task.low': 'Low',
  'task.medium': 'Medium',
  'task.high': 'High',
  'task.create': 'Create Task',
  'task.update': 'Update Task',
  'task.delete': 'Delete Task',
  'task.complete': 'Complete Task',
  'task.uncomplete': 'Mark as Active',
  'task.noTasks': 'No tasks found',
  'task.newTask': 'New Task',
  'task.searchPlaceholder': 'Search tasks...',
  
  // Recurrence
  'recurrence.recurrence': 'Recurrence',
  'recurrence.patternType': 'Pattern Type',
  'recurrence.daily': 'Daily',
  'recurrence.weekly': 'Weekly',
  'recurrence.monthly': 'Monthly',
  'recurrence.yearly': 'Yearly',
  'recurrence.interval': 'Interval',
  'recurrence.repeatEvery': 'Repeat every',
  'recurrence.daysOfWeek': 'Days of Week',
  'recurrence.daysOfMonth': 'Days of Month',
  'recurrence.endCondition': 'End Condition',
  'recurrence.never': 'Never',
  'recurrence.afterOccurrences': 'After Occurrences',
  'recurrence.onDate': 'On Date',
  'recurrence.occurrenceCount': 'Number of Occurrences',
  'recurrence.endDate': 'End Date',
  'recurrence.preview': 'Preview',
  'recurrence.nextOccurrences': 'Next Occurrences',
  'recurrence.futureInstancesOnly': 'Future Instances Only',
  'recurrence.allInstances': 'All Instances',
  
  // Reminders
  'reminder.reminder': 'Reminder',
  'reminder.reminders': 'Reminders',
  'reminder.add': 'Add Reminder',
  'reminder.remove': 'Remove Reminder',
  'reminder.time': 'Time',
  'reminder.scheduledTime': 'Scheduled Time',
  'reminder.deliveryStatus': 'Delivery Status',
  'reminder.pending': 'Pending',
  'reminder.sent': 'Sent',
  'reminder.delivered': 'Delivered',
  'reminder.failed': 'Failed',
  'reminder.snooze': 'Snooze',
  'reminder.dismiss': 'Dismiss',
  'reminder.channel': 'Channel',
  'reminder.browser': 'Browser',
  'reminder.inApp': 'In-App',
  'reminder.email': 'Email',
  
  // Tags
  'tag.tag': 'Tag',
  'tag.tags': 'Tags',
  'tag.tagName': 'Tag Name',
  'tag.color': 'Color',
  'tag.addTag': 'Add Tag',
  'tag.removeTag': 'Remove Tag',
  'tag.selectAll': 'Select All',
  'tag.selectNone': 'Select None',
  'tag.createNew': 'Create New',
  'tag.assign': 'Assign',
  'tag.unassign': 'Unassign',
  'tag.filterBy': 'Filter by',
  'tag.noTags': 'No tags',
  'tag.newTag': 'New Tag',
  'tag.editTag': 'Edit Tag',
  'tag.deleteTag': 'Delete Tag',
  
  // Timezone
  'timezone.timezone': 'Timezone',
  'timezone.select': 'Select Timezone',
  'timezone.current': 'Current Timezone',
  'timezone.useLocal': 'Use Local Time',
  'timezone.useUTC': 'Use UTC',
  'timezone.offset': 'Offset',
  'timezone.gmt': 'GMT',
  
  // Errors
  'error.requiredField': 'This field is required',
  'error.invalidEmail': 'Please enter a valid email address',
  'error.passwordMismatch': 'Passwords do not match',
  'error.networkError': 'Network error occurred',
  'error.unauthorized': 'Unauthorized access',
  'error.notFound': 'Resource not found',
  'error.serverError': 'Server error occurred',
  'error.generic': 'An error occurred',
  'error.invalidDate': 'Please enter a valid date',
  'error.invalidTime': 'Please enter a valid time',
  'error.invalidColor': 'Please enter a valid color',
  'error.maxLength': 'Maximum length exceeded',
  'error.minLength': 'Minimum length not met',
  'error.minValue': 'Value is too small',
  'error.maxValue': 'Value is too large',
};

// Spanish translations
const esTranslations: Translations['es'] = {
  // General
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.create': 'Crear',
  'common.update': 'Actualizar',
  'common.search': 'Buscar',
  'common.filter': 'Filtrar',
  'common.reset': 'Restablecer',
  'common.close': 'Cerrar',
  'common.back': 'Atrás',
  'common.next': 'Siguiente',
  'common.previous': 'Anterior',
  'common.loading': 'Cargando...',
  'common.error': 'Error',
  'common.success': 'Éxito',
  
  // Authentication
  'auth.login': 'Iniciar Sesión',
  'auth.register': 'Registrar',
  'auth.logout': 'Cerrar Sesión',
  'auth.username': 'Nombre de usuario',
  'auth.password': 'Contraseña',
  'auth.email': 'Correo electrónico',
  'auth.confirmPassword': 'Confirmar contraseña',
  'auth.forgotPassword': '¿Olvidó su contraseña?',
  'auth.signIn': 'Iniciar sesión',
  'auth.signUp': 'Registrarse',
  'auth.alreadyHaveAccount': '¿Ya tiene una cuenta?',
  'auth.createNewAccount': 'Crear una nueva cuenta',
  
  // Tasks
  'task.title': 'Título',
  'task.description': 'Descripción',
  'task.status': 'Estado',
  'task.priority': 'Prioridad',
  'task.dueDate': 'Fecha de vencimiento',
  'task.createdAt': 'Creado el',
  'task.updatedAt': 'Actualizado el',
  'task.completedAt': 'Completado el',
  'task.active': 'Activo',
  'task.completed': 'Completado',
  'task.low': 'Baja',
  'task.medium': 'Media',
  'task.high': 'Alta',
  'task.create': 'Crear tarea',
  'task.update': 'Actualizar tarea',
  'task.delete': 'Eliminar tarea',
  'task.complete': 'Completar tarea',
  'task.uncomplete': 'Marcar como activa',
  'task.noTasks': 'No se encontraron tareas',
  'task.newTask': 'Nueva tarea',
  'task.searchPlaceholder': 'Buscar tareas...',
  
  // Recurrence
  'recurrence.recurrence': 'Recurrencia',
  'recurrence.patternType': 'Tipo de patrón',
  'recurrence.daily': 'Diario',
  'recurrence.weekly': 'Semanal',
  'recurrence.monthly': 'Mensual',
  'recurrence.yearly': 'Anual',
  'recurrence.interval': 'Intervalo',
  'recurrence.repeatEvery': 'Repetir cada',
  'recurrence.daysOfWeek': 'Días de la semana',
  'recurrence.daysOfMonth': 'Días del mes',
  'recurrence.endCondition': 'Condición de finalización',
  'recurrence.never': 'Nunca',
  'recurrence.afterOccurrences': 'Después de ocurrencias',
  'recurrence.onDate': 'En fecha',
  'recurrence.occurrenceCount': 'Número de ocurrencias',
  'recurrence.endDate': 'Fecha de finalización',
  'recurrence.preview': 'Vista previa',
  'recurrence.nextOccurrences': 'Próximas ocurrencias',
  'recurrence.futureInstancesOnly': 'Solo instancias futuras',
  'recurrence.allInstances': 'Todas las instancias',
  
  // Reminders
  'reminder.reminder': 'Recordatorio',
  'reminder.reminders': 'Recordatorios',
  'reminder.add': 'Agregar recordatorio',
  'reminder.remove': 'Eliminar recordatorio',
  'reminder.time': 'Hora',
  'reminder.scheduledTime': 'Hora programada',
  'reminder.deliveryStatus': 'Estado de entrega',
  'reminder.pending': 'Pendiente',
  'reminder.sent': 'Enviado',
  'reminder.delivered': 'Entregado',
  'reminder.failed': 'Fallido',
  'reminder.snooze': 'Posponer',
  'reminder.dismiss': 'Descartar',
  'reminder.channel': 'Canal',
  'reminder.browser': 'Navegador',
  'reminder.inApp': 'En la aplicación',
  'reminder.email': 'Correo electrónico',
  
  // Tags
  'tag.tag': 'Etiqueta',
  'tag.tags': 'Etiquetas',
  'tag.tagName': 'Nombre de etiqueta',
  'tag.color': 'Color',
  'tag.addTag': 'Agregar etiqueta',
  'tag.removeTag': 'Eliminar etiqueta',
  'tag.selectAll': 'Seleccionar todo',
  'tag.selectNone': 'Seleccionar ninguno',
  'tag.createNew': 'Crear nuevo',
  'tag.assign': 'Asignar',
  'tag.unassign': 'Desasignar',
  'tag.filterBy': 'Filtrar por',
  'tag.noTags': 'Sin etiquetas',
  'tag.newTag': 'Nueva etiqueta',
  'tag.editTag': 'Editar etiqueta',
  'tag.deleteTag': 'Eliminar etiqueta',
  
  // Timezone
  'timezone.timezone': 'Zona horaria',
  'timezone.select': 'Seleccionar zona horaria',
  'timezone.current': 'Zona horaria actual',
  'timezone.useLocal': 'Usar hora local',
  'timezone.useUTC': 'Usar UTC',
  'timezone.offset': 'Desplazamiento',
  'timezone.gmt': 'GMT',
  
  // Errors
  'error.requiredField': 'Este campo es obligatorio',
  'error.invalidEmail': 'Por favor ingrese un correo electrónico válido',
  'error.passwordMismatch': 'Las contraseñas no coinciden',
  'error.networkError': 'Ocurrió un error de red',
  'error.unauthorized': 'Acceso no autorizado',
  'error.notFound': 'Recurso no encontrado',
  'error.serverError': 'Ocurrió un error del servidor',
  'error.generic': 'Ocurrió un error',
  'error.invalidDate': 'Por favor ingrese una fecha válida',
  'error.invalidTime': 'Por favor ingrese una hora válida',
  'error.invalidColor': 'Por favor ingrese un color válido',
  'error.maxLength': 'Longitud máxima excedida',
  'error.minLength': 'Longitud mínima no alcanzada',
  'error.minValue': 'El valor es demasiado pequeño',
  'error.maxValue': 'El valor es demasiado grande',
};

// Initialize translations object
const translations: Translations = {
  en: enTranslations,
  es: esTranslations,
  // Additional languages would be added here
};

// Current locale state
let currentLocale: Locale = 'en';

// Get the current locale
export const getLocale = (): Locale => {
  return currentLocale;
};

// Set the locale
export const setLocale = (locale: Locale): void => {
  if (SUPPORTED_LOCALES.includes(locale)) {
    currentLocale = locale;
  } else {
    console.warn(`Unsupported locale: ${locale}. Falling back to 'en'.`);
    currentLocale = 'en';
  }
};

// Get a translation for the current locale
export const t = (key: TranslationKey, fallback?: string): string => {
  const translation = translations[currentLocale]?.[key] || fallback || key;
  return translation;
};

// Get a translation for a specific locale
export const tForLocale = (locale: Locale, key: TranslationKey, fallback?: string): string => {
  const translation = translations[locale]?.[key] || fallback || key;
  return translation;
};

// Add translations for a locale
export const addTranslations = (locale: Locale, newTranslations: Partial<Translations['en']>): void => {
  if (!translations[locale]) {
    translations[locale] = {} as Translations[typeof locale];
  }
  
  translations[locale] = { ...translations[locale], ...newTranslations };
};

// Get all available translations for a locale
export const getTranslationsForLocale = (locale: Locale): Translations[Locale] | undefined => {
  return translations[locale];
};

// Initialize i18n with user's preferred locale
export const initializeI18n = (): void => {
  // Try to get user's preferred locale from browser or storage
  const browserLocale = navigator.language.split('-')[0] as Locale;
  const storedLocale = localStorage.getItem('locale') as Locale | null;
  
  // Set the locale based on priority: stored > browser > default
  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
    setLocale(storedLocale);
  } else if (SUPPORTED_LOCALES.includes(browserLocale)) {
    setLocale(browserLocale);
  } else {
    // Default to English if no supported locale is found
    setLocale('en');
  }
};

// Update stored locale preference
export const updateStoredLocale = (locale: Locale): void => {
  if (SUPPORTED_LOCALES.includes(locale)) {
    localStorage.setItem('locale', locale);
  }
};

// Initialize i18n when module loads
initializeI18n();