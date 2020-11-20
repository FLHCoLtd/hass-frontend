import "@material/mwc-button";
import "@material/mwc-icon-button";
import "@material/mwc-list/mwc-list-item";
import type { RequestSelectedDetail } from "@material/mwc-list/mwc-list-item";
import {
  mdiArrowLeft,
  mdiCodeBracesBox,
  mdiDotsVertical,
  mdiFormSelect,
  mdiTrashCanOutline,
} from "@mdi/js";
import {
  css,
  CSSResult,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  query,
  TemplateResult,
} from "lit-element";
import { fireEvent, HASSDomEvent } from "../../../common/dom/fire_event";
import { shouldHandleRequestSelectedEvent } from "../../../common/mwc/handle-request-selected-event";
import "../../../components/ha-button-menu";
import "../../../components/ha-svg-icon";
import type { HomeAssistant } from "../../../types";
import type { LovelaceRowConfig } from "../entity-rows/types";
import type { LovelaceHeaderFooterConfig } from "../header-footer/types";
import "./entity-row-editor/hui-row-element-editor";
import "./header-footer-editor/hui-header-footer-element-editor";
import type { HuiElementEditor } from "./hui-element-editor";
import type { GUIModeChangedEvent, SubElementEditorConfig } from "./types";

declare global {
  interface HASSDomEvents {
    "go-back": undefined;
  }
}

@customElement("hui-sub-element-editor")
export class HuiSubElementEditor extends LitElement {
  public hass!: HomeAssistant;

  @property({ attribute: false }) public config!: SubElementEditorConfig;

  @property({ type: Boolean }) public isAdvancedUser? = false;

  @internalProperty() private _guiModeAvailable = true;

  @internalProperty() private _guiMode = true;

  @query(".editor") private _editorElement?: HuiElementEditor<
    LovelaceRowConfig | LovelaceHeaderFooterConfig
  >;

  protected render(): TemplateResult {
    return html`
      <div class="header">
        <div class="back-title">
          <mwc-icon-button @click=${this._goBack}>
            <ha-svg-icon .path=${mdiArrowLeft}></ha-svg-icon>
          </mwc-icon-button>
          <span slot="title"
            >${this.hass.localize(
              `ui.panel.lovelace.editor.sub-element-editor.types.${this.config?.type}`
            )}</span
          >
        </div>

        <ha-button-menu
          fixed
          corner="BOTTOM_START"
          slot="secondaryAction"
          @closed=${(ev) => ev.stopPropagation()}
        >
          <mwc-icon-button
            slot="trigger"
            .label=${this.hass!.localize("ui.panel.lovelace.editor.menu.open")}
            .title=${this.hass!.localize("ui.panel.lovelace.editor.menu.open")}
          >
            <ha-svg-icon .path=${mdiDotsVertical}></ha-svg-icon>
          </mwc-icon-button>
          ${this.isAdvancedUser
            ? html`
                <mwc-list-item
                  graphic="icon"
                  .label=${this.hass!.localize(
                    this._guiMode
                      ? "ui.panel.lovelace.editor.edit_card.show_code_editor"
                      : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
                  )}
                  .disabled=${!this._guiModeAvailable}
                  @request-selected=${this._toggleMode}
                >
                  <span
                    >${this.hass!.localize(
                      this._guiMode
                        ? "ui.panel.lovelace.editor.edit_card.show_code_editor"
                        : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
                    )}</span
                  >
                  <ha-svg-icon
                    slot="graphic"
                    .path=${this._guiMode ? mdiCodeBracesBox : mdiFormSelect}
                  ></ha-svg-icon>
                </mwc-list-item>
              `
            : ""}
          <mwc-list-item
            graphic="icon"
            .label=${this.hass!.localize(
              "ui.panel.lovelace.editor.common.delete"
            )}
            @request-selected=${this._remove}
          >
            <span
              >${this.hass!.localize(
                "ui.panel.lovelace.editor.common.delete"
              )}</span
            >
            <ha-svg-icon
              slot="graphic"
              .path=${mdiTrashCanOutline}
            ></ha-svg-icon>
          </mwc-list-item>
        </ha-button-menu>
      </div>
      ${this.config.type === "row"
        ? html`
            <hui-row-element-editor
              class="editor"
              .hass=${this.hass}
              .value=${this.config.elementConfig}
              @config-changed=${this._handleConfigChanged}
              @GUImode-changed=${this._handleGUIModeChanged}
            ></hui-row-element-editor>
          `
        : this.config.type === "header" || this.config.type === "footer"
        ? html`
            <hui-headerfooter-element-editor
              class="editor"
              .hass=${this.hass}
              .value=${this.config.elementConfig}
              @config-changed=${this._handleConfigChanged}
              @GUImode-changed=${this._handleGUIModeChanged}
            ></hui-headerfooter-element-editor>
          `
        : ""}
    `;
  }

  private _goBack(): void {
    fireEvent(this, "go-back");
  }

  private _toggleMode(ev: CustomEvent<RequestSelectedDetail>): void {
    if (!shouldHandleRequestSelectedEvent(ev)) {
      return;
    }
    this._editorElement?.toggleMode();
  }

  private _remove(ev: CustomEvent<RequestSelectedDetail>): void {
    if (!shouldHandleRequestSelectedEvent(ev)) {
      return;
    }
    fireEvent(this, "config-changed", { config: undefined });
  }

  private _handleGUIModeChanged(ev: HASSDomEvent<GUIModeChangedEvent>): void {
    ev.stopPropagation();
    this._guiMode = ev.detail.guiMode;
    this._guiModeAvailable = ev.detail.guiModeAvailable;
  }

  private _handleConfigChanged(ev: CustomEvent): void {
    this._guiModeAvailable = ev.detail.guiModeAvailable;
  }

  static get styles(): CSSResult {
    return css`
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .back-title {
        display: flex;
        align-items: center;
        font-size: 18px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-sub-element-editor": HuiSubElementEditor;
  }
}