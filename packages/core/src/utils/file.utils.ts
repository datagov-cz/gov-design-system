export function formatBytes(bytes: any): string {
	const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
	let l = 0,
		n = parseInt(bytes, 10) || 0

	while (n >= 1024 && ++l) {
		n = n / 1024
	}

	return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]
}

export function fileAcceptValidation(file: File, accept: string): boolean {
	if (typeof accept === 'string' && accept.length) {
		const fileName = file.name.toLowerCase()
		const fileType = file.type.toLowerCase()

		return accept
			.replace(/\s/g, '')
			.toLowerCase()
			.split(',')
			.filter(token => token.length)
			.some(token => {
				if (token.startsWith('.')) {
					return fileName.endsWith(token)
				}
				if (token.endsWith('/*')) {
					return fileType.startsWith(token.slice(0, -1))
				}
				return fileType === token
			})
	} else {
		return true
	}
}

export function fileSizeValidation(file: File, maxSize: number): boolean {
	const fileSize = Math.round(file.size)
	return fileSize <= maxSize
}
