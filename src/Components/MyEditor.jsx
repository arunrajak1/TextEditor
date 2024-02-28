  import React, { useState } from "react";
  import { EditorState, convertToRaw,  Modifier,convertFromRaw } from "draft-js";
  import { Editor } from "react-draft-wysiwyg";
  import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";


  export default function MyEditor() {
    const [editorState, setEditorState] = useState(() => {
      const savedContent = localStorage.getItem('editorContent');
      if (savedContent) {
        const contentState = convertFromRaw(JSON.parse(savedContent));
        return EditorState.createWithContent(contentState);
      }
      return EditorState.createEmpty();
    });

    const handleChange = (newEditorState) => {
      const contentState = newEditorState.getCurrentContent();
      const selection = newEditorState.getSelection();
      const currentContent = newEditorState.getCurrentContent();
      const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
      const text = currentBlock.getText();
      // let inlineStyle = {};

      if (selection.isCollapsed() && currentBlock.getType() === "unstyled") {
        
        let newSelection = selection;

        if (text.trim().startsWith("# ") && text.length > 2) {
          let newContentState = Modifier.setBlockType(contentState, selection, "header-one");
          newContentState = Modifier.replaceText(newContentState, selection.merge({
              anchorOffset: 0,
              focusOffset: 2,
          }), "")
          newEditorState = EditorState.push(newEditorState, newContentState, "change-block-type");
          const updatedSelection = newEditorState.getSelection();
          const newSelection = updatedSelection.merge({
              anchorOffset: text.length - 2,
              focusOffset: text.length - 2 
          });
          newEditorState = EditorState.forceSelection(newEditorState, newSelection);
      }
          
        // Check for '*' followed by space for bold
        if (text.trim().startsWith("*** ") && text.length > 3) {
          let newContentState = Modifier.applyInlineStyle(contentState, selection, "UNDERLINE");
          newContentState = Modifier.replaceText(newContentState, selection.merge({
            anchorOffset: 0,
            focusOffset: 2,
          }), "");
          const newSelection = selection.merge({
            anchorOffset: 0,
            focusOffset: text.length + 2,
          });
          newEditorState = EditorState.push(newEditorState, newContentState, "change-inline-style");
          newEditorState = EditorState.forceSelection(newEditorState, newSelection); // Ensure new selection
        } else if (text.trim().startsWith("** ") && text.length > 2) {
          let newContentState = Modifier.applyInlineStyle(contentState, selection, "color-red");
          newContentState = Modifier.replaceText(newContentState, selection.merge({
            anchorOffset: 0,
            focusOffset: 2,
          }), "");
          const newSelection = selection.merge({
            anchorOffset: text.length-2,
            focusOffset: text.length - 2,
          });
          newEditorState = EditorState.push(newEditorState, newContentState, "change-inline-style");
          newEditorState = EditorState.forceSelection(newEditorState, newSelection); // Ensure new selection
        } else if (text.trim().startsWith("* ") && text.length > 2) {
          let newContentState = Modifier.applyInlineStyle(contentState, selection, "BOLD");
          newContentState = Modifier.replaceText(newContentState, selection.merge({
            anchorOffset: 0,
            focusOffset: 2,
          }), "");
          const newSelection = selection.merge({
            anchorOffset: 1,
            focusOffset: text.length - 1,
          });
          newEditorState = EditorState.push(newEditorState, newContentState, "change-inline-style");
          newEditorState = EditorState.forceSelection(newEditorState, newSelection); // Ensure new selection
        }
        
        if (newEditorState !== undefined) {
          setEditorState(EditorState.forceSelection(newEditorState, newSelection));
          saveContentToLocalStorage(convertToRaw(newEditorState.getCurrentContent()));
        }
      }

      setEditorState(newEditorState);
      saveContentToLocalStorage(convertToRaw(newEditorState.getCurrentContent()));
    };

    const handleSave = () => {
      saveContentToLocalStorage(convertToRaw(editorState.getCurrentContent()));
    };

    const saveContentToLocalStorage = (content) => {
      localStorage.setItem('editorContent', JSON.stringify(content));
    };

    return (
      <div className="App">
        <div className="title">
          <h1>Texteditor by Arun Rajak</h1>
          <button onClick={handleSave} className="button">Save</button>
        </div>

        <Editor
          editorState={editorState}
          onEditorStateChange={handleChange}
          wrapperClassName="wrapper-class"
          editorClassName="editor-class"
          toolbarClassName="toolbar-class"

        />
      </div>
    );
  }
