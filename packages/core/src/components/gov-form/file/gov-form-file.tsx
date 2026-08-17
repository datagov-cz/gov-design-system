import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from "@stencil/core"
import { createID } from "../../../utils/string.utils"
import { FormFileClass } from "./constants"
import { govHost, toBoolAttr, toBoolAttrIfDefined } from "../../../helpers/Dom/template"
import { validateWcagLabelFor, validateWcagRef } from "../../../helpers/Validate/wcag"
import { canValidateWcagOnRender } from "../../../helpers/Dom/win"
import { fileAcceptValidation, fileSizeValidation, formatBytes } from "../../../utils/file.utils"
import { delay } from "../../../utils/utils"
import { GovForm } from "../../../helpers/Dom/form.types"
import { GovHost } from "../../../helpers/Dom/template.types"
import { govForm } from "../../../helpers/Dom/form"
import { GovFormFileEvent, GovFormFileItem } from "./gov-form-file.types"

@Component({
	tag: "gov-form-file",
	styleUrl: "gov-form-file.scss",
})
export class GovFormFile {
	private f: GovForm
	private readonly h: GovHost

	private areaRef?: HTMLDivElement
	private inputRef?: HTMLInputElement
	private readonly fileId: string

	constructor() {
		this.fileId = createID("GovInputFile")

		this.h = govHost(this.host)
		this.f = govForm(this.h)
	}

	@Element() host: HTMLGovFormFileElement
	/**
	 * Expands the file input to fill 100% of the container width.
	 */
	@Prop() readonly expanded: boolean = false
	/**
	 * Set whether the input is required or not. Please note that this is necessary for accessible inputs when the user is required to fill them.
	 * When using this property you need to also set “novalidate” attribute to your form element to prevent browser from displaying its own validation errors.
	 */
	@Prop() readonly required: boolean = false
	/**
	 * Makes the File component disabled.
	 * This prevents users from being able to interact with the File, and conveys its inactive state to assistive technologies.
	 */
	@Prop() readonly disabled: boolean = false
	/**
	 * Show list of attachments
	 */
	@Prop({ attribute: "display-attachments" }) readonly displayAttachments: boolean = true
	/**
	 * Name of the input.
	 */
	@Prop() readonly name: string
	/**
	 * Same as original parameter
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
	 */
	@Prop() readonly accept: string
	/**
	 * Same as original parameter
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/multiple
	 */
	@Prop() readonly multiple: boolean = false
	/**
	 * Maximum embedded file size
	 */
	@Prop({ attribute: "max-file-size" }) readonly maxFileSize: number = -1
	/**
	 * Custom File identifier.
	 */
	@Prop({ attribute: "identifier" }) readonly identifier: string
	/**
	 * Indicates the entered value does not conform to the format expected by the application.
	 */
	@Prop() readonly invalid: boolean
	/**
	 * Error message when the maximum file size is exceeded
	 */
	@Prop({ attribute: "error-size" }) readonly errorSize: string = "Soubor je větší než povolená velikost {FILE_SIZE}"
	/**
	 * Insert unsupported file error message
	 */
	@Prop({ attribute: "error-accept" }) readonly errorAccept: string = "Soubor tohoto typu není povolen"
	/**
	 * Description of the list of attachments
	 */
	@Prop({ attribute: "attachments-label" }) readonly attachmentsLabel: string = "Přílohy"
	/**
	 * Indicates the id of a component that describes the input.
	 */
	@Prop({ attribute: "wcag-described-by" }) readonly wcagDescribedBy: string
	/**
	 * Indicates the id of a component that labels the input.
	 */
	@Prop({ attribute: "wcag-labelled-by" }) readonly wcagLabelledBy: string
	/**
	 * Adds accessible label for the remove button that is only shown for screen readers.
	 */
	@Prop({ attribute: "wcag-remove-label" }) readonly wcagRemoveLabel: string = "Odebrat soubor {FILE_NAME}"
	/**
	 * Adds accessible label for the list of attachments.
	 */
	@Prop({ attribute: "wcag-attachments-label" }) readonly wcagAttachmentsLabel: string = "Přílohy"
	/**
	 * Emitted when the File has focus.
	 */
	@Event({ eventName: "gov-focus" }) govFocus: EventEmitter<GovFormFileEvent>
	/**
	 * Emitted when the File loses focus.
	 */
	@Event({ eventName: "gov-blur" }) govBlur: EventEmitter<GovFormFileEvent>
	/**
	 * Called when the list of inserted files is changed
	 */
	@Event({ eventName: "gov-files" }) govFiles: EventEmitter<GovFormFileEvent>
	/**
	 * Called when a new file is added
	 */
	@Event({ eventName: "gov-add-file" }) govAddFile: EventEmitter<GovFormFileEvent>
	/**
	 * Called when a file is removed from the list
	 */
	@Event({ eventName: "gov-remove-file" }) govRemoveFile: EventEmitter<GovFormFileEvent>

	@State() files: GovFormFileItem[] = []

	@Watch("disabled")
	@Watch("invalid")
	watchDisabled(): void {
		this.passControlAttrs()
	}

	private passControlAttrs() {
		this.f.passAttrToControl("disabled", toBoolAttr(this.disabled))
		this.f.passAttrToControl("invalid", toBoolAttr(this.invalid))
		this.f.passAttrToControl("type", "File")
	}

	private registerListeners() {
		function highlight() {
			this.areaRef.classList.add("highlight")
		}

		function unhighlight() {
			this.areaRef.classList.remove("highlight")
		}

		this.inputRef.addEventListener(
			"change",
			e => {
				e.preventDefault()
				e.stopPropagation()
				const files = (e.target as HTMLInputElement).files
				this.validateFiles(files)
			},
			false,
		)
		//this.inputRef.addEventListener('focus')

		if (this.expanded) {
			const events = ["dragover", "dragleave"]
			const inEvents = ["dragenter", "dragover", "mouseenter"]
			const outEvents = ["dragleave", "drop", "mouseleave"]

			events.map(eventName => this.inputRef.addEventListener(eventName, this.preventDefaults.bind(this), false))
			inEvents.map(eventName => this.inputRef.addEventListener(eventName, highlight.bind(this), false))
			outEvents.forEach(eventName => this.inputRef.addEventListener(eventName, unhighlight.bind(this), false))

			this.areaRef.addEventListener("drop", this.handleDrop.bind(this), false)
		}
	}

	preventDefaults(e) {
		e.preventDefault()
		e.stopPropagation()
	}

	handleDrop(e: DragEvent) {
		const dataTransfer = e.dataTransfer
		this.validateFiles(dataTransfer.files)
	}

	private validateFiles(files: FileList) {
		const incomingFiles = this.multiple ? Array.from(files) : Array.from(files).slice(0, 1)
		let filesBuffer: GovFormFileItem[] = []

		if (!this.multiple && this.displayAttachments && this.files.length && incomingFiles.length) {
			this.files.forEach(removedFile => {
				this.govRemoveFile.emit({
					component: FormFileClass.root,
					file: removedFile,
				})
			})
			this.files = []
		}

		incomingFiles.map(file => {
			const isFile = this.files.find(item => item.file.name === file.name && item.file.size === file.size) || null
			if (isFile === null) {
				const isSizeValid = typeof this.maxFileSize === "number" && this.maxFileSize > 0 ? fileSizeValidation(file, this.maxFileSize) : true
				const isAcceptValid = fileAcceptValidation(file, this.accept)
				const newFile = {
					id: createID("GovFormFile"),
					file,
					acceptValid: isAcceptValid,
					sizeValid: isSizeValid,
				}
				if (this.displayAttachments) {
					this.files = [...this.files, newFile]
				} else {
					filesBuffer = [...filesBuffer, newFile]
				}
				this.govAddFile.emit({
					component: FormFileClass.root,
					file: newFile,
				})
			}
		})

		this.govFiles.emit({
			component: FormFileClass.root,
			files: filesBuffer.length ? filesBuffer : this.files,
		})
	}

	componentWillLoad() {
		this.f.passAttrToLabel("required", String(this.required))
		this.watchDisabled()
	}

	async componentDidRender() {
		if (canValidateWcagOnRender()) {
			await delay(500)
			await this.validateWcag()
		}

		this.registerListeners()
	}

	render() {
		return (
			<Host class={this.h.classes([FormFileClass.root])} invalid={toBoolAttrIfDefined(this.invalid)} expanded={toBoolAttrIfDefined(this.expanded)}>
				<div class={FormFileClass.area} ref={el => (this.areaRef = el as HTMLDivElement)}>
					<slot />
					<input
						class={FormFileClass.input}
						ref={el => (this.inputRef = el as HTMLInputElement)}
						id={this.identifier || this.fileId}
						type="file"
						name={this.name}
						accept={this.accept}
						multiple={this.multiple}
						onChange={this.onChangeHandler.bind(this)}
						onFocus={this.onFocusHandler.bind(this)}
						onBlur={this.onBlurHandler.bind(this)}
						required={this.required}
						disabled={this.disabled}
						aria-required={toBoolAttrIfDefined(this.required)}
						aria-invalid={toBoolAttrIfDefined(this.invalid)}
						aria-describedby={this.wcagDescribedBy}
						aria-labelledby={this.wcagLabelledBy}
						aria-disabled={toBoolAttrIfDefined(this.disabled)}
					/>
				</div>

				{this.h.hasSlot("attachments") ? (
					<div class={FormFileClass.attachments}>
						<slot name={"attachments"} />
					</div>
				) : null}

				{this.files.length && this.displayAttachments ? (
					<div class={FormFileClass.attachments}>
						<gov-attachments label={this.wcagAttachmentsLabel} wcag-label={this.wcagAttachmentsLabel}>
							{this.files.map(item => (
								<gov-attachments-item wcag-remove-labelled-by={item.id} on-gov-remove={() => this.onRemoveFileHandler(item)}>
									<span class={"sr-only"} id={item.id}>
										{this.wcagRemoveLabel.replace("{FILE_NAME}", item.file.name)}
									</span>
									{item.file.name}
									{item.acceptValid === false ? (
										<gov-form-message slot="message" variant="error">
											<gov-icon slot="icon" name="exclamation-triangle-fill"></gov-icon>
											{item.acceptValid === false ? this.errorAccept : null}
										</gov-form-message>
									) : null}
									{item.sizeValid === false ? (
										<gov-form-message slot="message" variant="error">
											<gov-icon slot="icon" name="exclamation-triangle-fill"></gov-icon>
											{this.errorSize.replace("{FILE_SIZE}", formatBytes(this.maxFileSize))}
										</gov-form-message>
									) : null}
									<span slot="info">({formatBytes(item.file.size)})</span>
								</gov-attachments-item>
							))}
						</gov-attachments>
					</div>
				) : null}
			</Host>
		)
	}

	private onRemoveFileHandler(file: GovFormFileItem) {
		const index = this.files.findIndex(item => item.id === file.id)
		if (index !== -1) {
			const files = this.files
			const removeFile = this.files[index]
			files.splice(index, 1)
			this.files = [...files]
			this.govRemoveFile.emit({
				component: FormFileClass.root,
				file: removeFile,
			})
			this.govFiles.emit({
				component: FormFileClass.root,
				files,
			})
		}
	}

	private onFocusHandler(e: FocusEvent) {
		e.stopPropagation()
		this.govFocus.emit({
			component: FormFileClass.root,
			originalEvent: e,
		})
	}

	private onBlurHandler(e: FocusEvent) {
		e.stopPropagation()
		this.govBlur.emit({
			component: FormFileClass.root,
			originalEvent: e,
		})
	}

	private onChangeHandler(e: Event) {
		e.stopPropagation()
	}

	/**
	 * Returns the reference of the native element
	 */
	@Method()
	async getRef(): Promise<HTMLInputElement> {
		return this.inputRef
	}

	/**
	 * Returns the reference of the native area element
	 */
	@Method()
	async getAreaRef(): Promise<HTMLDivElement> {
		return this.areaRef
	}

	/**
	 * Remove all files from component state
	 */
	@Method()
	async reset(): Promise<void> {
		this.files = []
	}

	/**
	 * Validate the WCAG attributes of the component
	 */
	@Method()
	async validateWcag(): Promise<void> {
		validateWcagRef(this.wcagDescribedBy, "wcag-described-by", FormFileClass.root)
		validateWcagRef(this.wcagLabelledBy, "wcag-labelled-by", FormFileClass.root)
		validateWcagLabelFor(this.identifier || this.fileId, this.wcagLabelledBy, FormFileClass.root)
	}
}
