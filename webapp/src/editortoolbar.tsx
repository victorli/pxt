/// <reference path="../../built/pxtlib.d.ts" />

import * as React from "react";
import * as data from "./data";
import * as sui from "./sui";
import * as githubbutton from "./githubbutton";

type ISettingsProps = pxt.editor.ISettingsProps;

const enum View {
    Computer,
    Tablet,
    Mobile,
}

const tabletBreakpoint = 991;
const mobileBreakpoint = 813;

export class EditorToolbar extends data.Component<ISettingsProps, {}> {
    private attemptedPair = false;
    constructor(props: ISettingsProps) {
        super(props);

        this.saveProjectName = this.saveProjectName.bind(this);
        this.compile = this.compile.bind(this);
        this.saveFile = this.saveFile.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.startStopSimulator = this.startStopSimulator.bind(this);
        this.toggleTrace = this.toggleTrace.bind(this);
        this.toggleDebugging = this.toggleDebugging.bind(this);
    }

    saveProjectName(name: string, view?: string) {
        pxt.tickEvent("editortools.projectrename", { view: view }, { interactiveConsent: true });
        this.props.parent.updateHeaderName(name);
    }

    compile(view?: string) {
        pxt.tickEvent("editortools.download", { view: view, collapsed: this.getCollapsedState() }, { interactiveConsent: true });
        this.props.parent.compile();
    }

    saveFile(view?: string) {
        pxt.tickEvent("editortools.save", { view: view, collapsed: this.getCollapsedState() }, { interactiveConsent: true });
        this.props.parent.saveAndCompile();
    }

    undo(view?: string) {
        pxt.tickEvent("editortools.undo", { view: view, collapsed: this.getCollapsedState() }, { interactiveConsent: true });
        this.props.parent.editor.undo();
    }

    redo(view?: string) {
        pxt.tickEvent("editortools.redo", { view: view, collapsed: this.getCollapsedState() }, { interactiveConsent: true });
        this.props.parent.editor.redo();
    }

    zoomIn(view?: string) {
        pxt.tickEvent("editortools.zoomIn", { view: view, collapsed: this.getCollapsedState() }, { interactiveConsent: true });
        this.props.parent.editor.zoomIn();
        this.props.parent.forceUpdate();
    }

    zoomOut(view?: string) {
        pxt.tickEvent("editortools.zoomOut", { view: view, collapsed: this.getCollapsedState() }, { interactiveConsent: true });
        this.props.parent.editor.zoomOut();
        this.props.parent.forceUpdate();
    }

    startStopSimulator(view?: string) {
        pxt.tickEvent("editortools.startStopSimulator", { view: view, collapsed: this.getCollapsedState(), headless: this.getHeadlessState() }, { interactiveConsent: true });
        this.props.parent.startStopSimulator({ clickTrigger: true });
    }

    toggleTrace(view?: string) {
        pxt.tickEvent("editortools.trace", { view: view, collapsed: this.getCollapsedState(), headless: this.getHeadlessState() }, { interactiveConsent: true });
        this.props.parent.toggleTrace();
    }

    toggleDebugging(view?: string) {
        pxt.tickEvent("editortools.debug", { view: view, collapsed: this.getCollapsedState(), headless: this.getHeadlessState() }, { interactiveConsent: true });
        this.props.parent.toggleDebugging();
    }

    private getView(): View {
        let width = window.innerWidth;
        if (width < mobileBreakpoint) {
            return View.Mobile;
        } else if (width < tabletBreakpoint) {
            return View.Tablet;
        } else {
            return View.Computer;
        }
    }

    private getViewString(view: View): string {
        return view.toString().toLowerCase();
    }

    private getCollapsedState(): string {
        return '' + this.props.parent.state.collapseEditorTools;
    }

    private getHeadlessState(): string {
        return pxt.appTarget.simulator.headless ? "true" : "false";
    }

    private getUndoRedo(view: View): JSX.Element[] {
        const hasUndo = this.props.parent.editor.hasUndo();
        const hasRedo = this.props.parent.editor.hasRedo();
        return [<EditorToolbarButton icon='xicon undo' className={`editortools-btn undo-editortools-btn ${!hasUndo ? 'disabled' : ''}`} title={lf("Undo")} ariaLabel={lf("{0}, {1}", lf("Undo"), !hasUndo ? lf("Disabled") : "")} onButtonClick={this.undo} view={this.getViewString(view)} key="undo" />,
        <EditorToolbarButton icon='xicon redo' className={`editortools-btn redo-editortools-btn ${!hasRedo ? 'disabled' : ''}`} title={lf("Redo")} ariaLabel={lf("{0}, {1}", lf("Redo"), !hasRedo ? lf("Disabled") : "")} onButtonClick={this.redo} view={this.getViewString(view)} key="redo" />]
    }

    private getZoomControl(view: View): JSX.Element[] {
        return [<EditorToolbarButton icon='minus circle' className="editortools-btn zoomout-editortools-btn" title={lf("Zoom Out")} onButtonClick={this.zoomOut} view={this.getViewString(view)} key="minus" />,
        <EditorToolbarButton icon='plus circle' className="editortools-btn zoomin-editortools-btn" title={lf("Zoom In")} onButtonClick={this.zoomIn} view={this.getViewString(view)} key="plus" />]
    }

    private getSaveInput(view: View, showSave: boolean, id?: string, projectName?: string): JSX.Element[] {
        let saveButtonClasses = "";
        if (this.props.parent.state.isSaving) {
            saveButtonClasses = "loading disabled";
        } else if (!!this.props.parent.state.compiling) {
            saveButtonClasses = "disabled";
        }

        let saveInput = [];
        if (view != View.Mobile) {
            saveInput.push(<label htmlFor={id} className="accessible-hidden" key="label">{lf("Type a name for your project")}</label>);
            saveInput.push(<EditorToolbarSaveInput id={id} view={this.getViewString(view)} key="input"
                type="text"
                aria-labelledby={id}
                placeholder={lf("Pick a name...")}
                value={projectName || ''}
                onChangeValue={this.saveProjectName} />)
        }

        if (showSave) {
            const sizeClass = view == View.Computer ? 'small' : 'large';
            saveInput.push(<EditorToolbarButton icon='save' className={`${sizeClass} right attached editortools-btn save-editortools-btn ${saveButtonClasses}`} title={lf("Save")} ariaLabel={lf("Save the project")} onButtonClick={this.saveFile} view={this.getViewString(view)} key={`save${view}`} />)
        }

        if (pxt.appTarget.cloud && pxt.appTarget.cloud.githubPackages) {
            saveInput.push(<githubbutton.GithubButton parent={this.props.parent} key={`githubbtn${view}`} />)
        }

        return saveInput;
    }

    private getUSBHardwareBtn(view: View): JSX.Element {
        const sizeClass = view == View.Mobile ? 'small' : 'large';
        let icon = "microchip";

        const onHwBtnClick = () => {
            this.props.parent.showChooseHwDialog();
        }

        return <EditorToolbarButton key='hwbtn' className={`${sizeClass} editortools-btn hw-button`} icon={icon} onButtonClick={onHwBtnClick} dataTooltip={pxt.hwName || lf("Click to select hardware")} view={this.getViewString(view)} />
    }

    renderCore() {
        const { home, tutorialOptions, hideEditorFloats, collapseEditorTools, projectName, compiling, isSaving, simState, debugging } = this.props.parent.state;

        if (home) return <div />; // Don't render if we're in the home screen

        const targetTheme = pxt.appTarget.appTheme;
        const isController = pxt.shell.isControllerMode();
        const readOnly = pxt.shell.isReadOnly();
        const tutorial = tutorialOptions ? tutorialOptions.tutorial : false;
        const hideIteration = tutorialOptions && tutorialOptions.metadata && tutorialOptions.metadata.hideIteration;
        const simOpts = pxt.appTarget.simulator;
        const headless = simOpts.headless;
        const collapsed = (hideEditorFloats || collapseEditorTools) && (!tutorial || headless);
        const isEditor = this.props.parent.isBlocksEditor() || this.props.parent.isTextEditor();
        if (!isEditor) return <div />;

        const disableFileAccessinMaciOs = targetTheme.disableFileAccessinMaciOs && (pxt.BrowserUtils.isIOS() || pxt.BrowserUtils.isMac());
        const showSave = !readOnly && !isController && !targetTheme.saveInMenu && !tutorial && !debugging && !disableFileAccessinMaciOs;
        const compile = pxt.appTarget.compile;
        const compileBtn = compile.hasHex || compile.saveAsPNG || compile.useUF2;
        const compileTooltip = lf("Download your code to the {0}", targetTheme.boardName);
        const compileLoading = !!compiling;
        const running = simState == pxt.editor.SimState.Running;
        const starting = simState == pxt.editor.SimState.Starting;

        const hasUndo = this.props.parent.editor.hasUndo();

        const showProjectRename = !tutorial && !readOnly && !isController && !targetTheme.hideProjectRename && !debugging;
        const showUndoRedo = !readOnly && !debugging;
        const showZoomControls = true;
        const showGithub = !!pxt.appTarget.cloud && !!pxt.appTarget.cloud.githubPackages;

        const trace = !!targetTheme.enableTrace;
        const tracing = this.props.parent.state.tracing;
        const traceTooltip = tracing ? lf("Disable Slow-Mo") : lf("Slow-Mo")
        const debug = !!targetTheme.debugger && !readOnly;
        const debugTooltip = debugging ? lf("Disable Debugging") : lf("Debugging")
        const downloadIcon = pxt.appTarget.appTheme.downloadIcon || "download";
        const downloadText = pxt.appTarget.appTheme.useUploadMessage ? lf("Upload") : lf("Download");

        const bigRunButtonTooltip = [lf("Stop"), lf("Starting"), lf("Run Code in Game")][simState || 0];

        const view = this.getView();
        const twoRow = view != View.Computer && !collapsed;

        let downloadButtonClasses = "";
        let saveButtonClasses = "";
        if (isSaving) {
            downloadButtonClasses = "disabled";
            saveButtonClasses = "loading disabled";
        } else if (compileLoading) {
            downloadButtonClasses = "loading disabled";
            saveButtonClasses = "disabled";
        }

        return <div className={`ui equal width grid padded ${twoRow ? 'twoRow' : ''}`}>
            <div id="editorProjectArea" className={twoRow ? 'column' : 'ui grid'}>
                <div id="downloadArea">
                    <div className="ui input">
                        {compileBtn && <EditorToolbarButton icon={downloadIcon} className={`primary ${view == View.Computer ? 'huge' : 'large'} download-button ${downloadButtonClasses}`} text={(view == View.Computer || twoRow) ? downloadText : undefined} title={compileTooltip} onButtonClick={this.compile} view='computer' />}
                        {this.getUSBHardwareBtn(view)}
                    </div>
                </div>
                {showProjectRename &&
                    <div id="projectNameArea" className="column">
                        <div className={`ui right ${showSave ? "labeled" : ""} input projectname-input`} title={lf("Pick a name for your project")}>
                            {this.getSaveInput(view, showSave, "fileNameInput2", projectName)}
                        </div>
                    </div>}
            </div>
            <div id="editorToolbarArea" className="column right aligned">
                {showUndoRedo && <div className={`ui icon ${view == View.Computer || collapsed ? 'small' : 'large'} buttons`}>{this.getUndoRedo(view)}</div>}
                {showZoomControls && <div className={`ui icon ${view == View.Computer  || collapsed ? 'small' : 'large'} buttons`}>{this.getZoomControl(view)}</div>}
                {targetTheme.bigRunButton &&
                    <div className="big-play-button-wrapper">
                        <EditorToolbarButton role="menuitem" className={`big-play-button play-button ${running ? "stop" : "play"}`} key='runmenubtn' disabled={starting} icon={running ? "stop" : "play"} title={bigRunButtonTooltip} onButtonClick={this.startStopSimulator} view='computer' />
                    </div>}
            </div>
        </div>;
    }
}

interface EditorToolbarButtonProps extends sui.ButtonProps {
    view: string;
    onButtonClick: (view: string) => void;
}

class EditorToolbarButton extends sui.StatelessUIElement<EditorToolbarButtonProps> {
    constructor(props: EditorToolbarButtonProps) {
        super(props);
        this.state = {
        }

        console.log(this.props)

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const { onButtonClick, view } = this.props;
        onButtonClick(view);
    }

    renderCore() {
        const { onClick, onButtonClick, ...rest } = this.props;
        return <sui.Button {...rest} onClick={this.handleClick} />;
    }
}

interface EditorToolbarSaveInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    view: string;
    onChangeValue: (value: string, view: string) => void;
}

class EditorToolbarSaveInput extends sui.StatelessUIElement<EditorToolbarSaveInputProps> {

    constructor(props: EditorToolbarSaveInputProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { onChangeValue, view } = this.props;
        onChangeValue((e.target as any).value, view);
    }

    renderCore() {
        const { onChange, onChangeValue, view, ...rest } = this.props;
        return <input onChange={this.handleChange} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} {...rest} />
    }
}
