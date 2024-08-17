import { Provider } from 'react-redux'
import styles from './app.module.css'
import Header from './components/Header/Header'

function App() {

  return (
    <Provider store={store}>
      <div className={styles.main}>
        <Header />
      </div>
    </Provider>
  )
}

export default App
