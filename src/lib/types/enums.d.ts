export const enum StarlightEvents {
	TaskFound = 'taskFound',
	TaskCreated = 'taskCreated',
	Log = 'log',
	Warn = 'warn'
}

export const enum MimeTypes {
	ApplicationJson = 'application/json',
	ApplicationFormUrlEncoded = 'application/x-www-form-urlencoded',
	TextPlain = 'text/plain'
}

export const enum Time {
	Millisecond = 1,
	Second = Millisecond * 1000,
	Minute = Second * 60,
	Hour = Minute * 60,
	Day = Hour * 24,
	Year = Day * 365
}
