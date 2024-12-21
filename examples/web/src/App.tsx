import useStore from './store'

function App() {
  const { count, text, increase, decrease, setText } = useStore()
  const { undo, redo, clear, redoStack, undoStack } = useStore.temporal.getState()

  return (
    <>
      <div>
        Redo Stack:
        {JSON.stringify(redoStack)}
      </div>
      <div>
        Undo Stack:
        {JSON.stringify(undoStack)}
      </div>
      <div>
        Count:
        {count}
      </div>
      <div>
        Text:
        {text}
      </div>
      <button onClick={increase}>Increase</button>
      <button onClick={decrease}>Decrease</button>
      <button onClick={() => setText('hello')}>Set Text</button>
      <button onClick={() => undo()}>Undo</button>
      <button onClick={() => redo()}>Redo</button>
      <button onClick={clear}>Clear History</button>
    </>
  )
}

export default App
