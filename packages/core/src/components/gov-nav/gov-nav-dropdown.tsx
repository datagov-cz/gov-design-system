import { Component, Element, h, Host } from '@stencil/core'

enum State {
  Close,
  Open,
  Opening,
}

@Component({
  tag: 'gov-nav-dropdown',
  styleUrl: 'gov-nav-dropdown.scss',
})
export class GovNavItem {
  @Element() readonly host: HTMLGovNavDropdownElement

  /**
   * Store listener used to listen for global click event.
   */
  private documentOnClickListener

  private state = State.Close

  componentDidLoad() {
    this.documentOnClickListener = () => this.onClose()
    document.addEventListener("click", this.documentOnClickListener)
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.documentOnClickListener)
  }

  private onClose() {
    switch (this.state) {
      case State.Close:
        // Nothing to do here.
        break
      case State.Open:
        // Close.
        this.host.classList.remove("open")
        this.state = State.Close
        break
      case State.Opening:
        // Has been open in this event as the click bubbles to document.
        this.state = State.Open
        break;
    }
  }

  private onToggle() {
    switch (this.state) {
      case State.Close:
        this.host.classList.add("open",)
        this.state = State.Opening
        break
      case State.Open:
        this.host.classList.remove("open")
        this.state = State.Close
        break;
      case State.Opening:
        // This should not happen.
        break
    }
  }

  render() {
    return (
      <Host class={"gov-nav-dropdown"} onClick={() => this.onToggle()}>
        <div class="gov-nav-item__link">
          <slot name="label" />
        </div>
        <div class="dropdown">
          <slot name="dropdown" />
        </div>
      </Host>
    )
  }
}
