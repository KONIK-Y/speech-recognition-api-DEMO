import { useState } from 'react';
import './App.css';
import { SpeechRecognition } from './component/SpeechRecognition';
import { Helmet } from 'react-helmet';

function App() {
  const [audioURL, setAudioURL] = useState<string>('');
  const [onResultText, setOnResultText] = useState<string[]>([]);
  const [isOpen,  setIsOpen] = useState<boolean>(false);

  const onRecorded = (audioURL: string) => {
    setAudioURL(audioURL);
    console.log('onRecorded', audioURL);
  }
  const onResult = (result: string[]) => {
    setOnResultText(result);
  }

  const toggleDialog = () => {
    isOpen ? setIsOpen(false) : setIsOpen(true);
  }
  return (
    <>
      <Helmet>
        <title>Speech Recognition Demo</title>
      </Helmet>
      {isOpen ? (
        <SpeechRecognition  onRecorded={onRecorded} onResult={onResult} toggle={toggleDialog}/>
      ):(
        <></>
      )
      }
      <div className='flex justify-center mt-4'>
        <button onClick={toggleDialog} className='bg-slate-900 hover:bg-slate-700 text-white px-8 py-2 mx-auto rounded-base'>Start Recording</button>
      </div>
      <div id='result' className='flex flex-col w-4/6 max-w-96 mx-auto mt-8'>
        <p className='text-black'>音声入力結果：</p>
      {
        onResultText && <textarea className='w-full min-h-[200px] h-fit' value={onResultText.join('\n')} readOnly={true} style={{resize: 'none'}}></textarea>
      }
      {audioURL ? (
        <div>
          <audio className='mx-auto my-5' src={audioURL} controls></audio>
        </div>
        ):(<></>) 
      }
      </div>
    </>
  )
}

export default App
