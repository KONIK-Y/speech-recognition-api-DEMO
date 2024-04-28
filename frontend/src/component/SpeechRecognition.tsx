import { useState, useEffect, useRef } from 'react';
import IWindow from '../model/model';

declare const window: IWindow;

type Props = {
    onRecorded: (audioURL: string) => void;
    onResult: (result: string[]) => void;
    toggle: () => void;
}

export const SpeechRecognition = (props: Props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string>();
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [resultContext, setResultContext] = useState<string[]>();
    const analyserRef = useRef<AnalyserNode>();
    const mediaRecorderRef = useRef<MediaRecorder>();
    const animationFrameRef = useRef<number>();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    useEffect(() => {
        if (!SpeechRecognition) {
            alert("Speech Recognition API がサポートされていません");
            return;
        }

        // canvasの初期化
        canvasRef.current = document.getElementById('vu') as HTMLCanvasElement;
        const wrapper = document.getElementById('visualizer_wrapper') as HTMLElement;

        canvasRef.current && canvasRef.current.getContext('2d');
        const resizeCanvas = () => {
            if (canvasRef.current && wrapper) {
                canvasRef.current.width = wrapper.clientWidth * 0.9;
                canvasRef.current.height = wrapper.clientWidth * 0.8;
            }
        };
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas);


        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'ja-JP';
        recognition.interimResults = true;

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                // Docs: https://developer.mozilla.org/ja/docs/Web/API/MediaRecorder/MediaRecorder
                const ctx = new AudioContext();
                analyserRef.current = ctx.createAnalyser();
                const audioSource = ctx.createMediaStreamSource(stream);
                const analyserNode = ctx.createAnalyser();
                analyserNode.fftSize = 2048;
                analyserNode.smoothingTimeConstant = 0.8;
                audioSource.connect(analyserNode);
                // analyserNode.connect(ctx.destination); // 出力ノードには繋がない

                // const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
                const newRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                setMediaRecorder(newRecorder);

                mediaRecorderRef.current = newRecorder;

                const setupAudioTrack = () => {
                    const spectrums = new Uint8Array(analyserNode.fftSize);
                    analyserNode.getByteTimeDomainData(spectrums);

                    if (canvasRef.current) {
                        const canvas = canvasRef.current;
                        const canvasCtx = canvas.getContext('2d');
                        if (canvasCtx) {
                            const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
                            gradient.addColorStop(0, '#3DC8C2FF');
                            gradient.addColorStop(0.2, '#73FFFAFF');
                            gradient.addColorStop(0.4, '#DA91FFFF');
                            gradient.addColorStop(0.6, '#DA91FFFF');
                            gradient.addColorStop(0.8, '#73FFFAFF');
                            gradient.addColorStop(1, '#3DC8C2FF');
                            canvasCtx.fillStyle = gradient;

                            const width = canvasRef.current.width;
                            const height = canvasRef.current.height;
                            const centerX = width / 2;
                            const centerY = height / 2;
                            const radius = Math.min(centerX, centerY) * 0.7;

                            canvasCtx.clearRect(0, 0, width, height);
                            canvasCtx.strokeStyle = gradient;
                            canvasCtx.lineWidth = 2;
                            canvasCtx.beginPath();

                            spectrums.forEach((value, index) => {
                                const angle = (Math.PI * 2 / spectrums.length) * index;
                                const normValue = (value - 128) / 128;
                                const radiusAdjustment = normValue * radius * 0.3;
                                const x = centerX + (radius + radiusAdjustment) * Math.cos(angle);
                                const y = centerY + (radius + radiusAdjustment) * Math.sin(angle);
                                if (index === 0) {
                                    canvasCtx.moveTo(x, y);
                                } else {
                                    canvasCtx.lineTo(x, y);
                                }
                            });
                            canvasCtx.stroke();
                        }
                    }
                    animationFrameRef.current = requestAnimationFrame(setupAudioTrack)
                }
                newRecorder.onstart = () => {
                    console.log('newRecorder started:', recognition);
                    setRecording(true);
                    setupAudioTrack();
                    recognition.start();
                }

                newRecorder.onstop = () => {
                    console.log('newRecorder stopped:', recognition);
                    setRecording(false);
                    animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
                    recognition.stop();
                }

                newRecorder.ondataavailable = async (event) => {
                    const audioBlob = event.data;
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioURL(audioUrl);
                    props.onRecorded(audioUrl);
                };

                recognition.onresult = () => {
                    console.log('on result')
                    recognition.stop()
                }

                recognition.onresult = (event) => {
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (!event.results[i].isFinal) continue
                        // 認識結果を配列で取得                        
                        const resultTexts = event.results? Array.from(event.results)
                                                                .filter(result => result.isFinal)
                                                                .map(result => result[0] ? result[0].transcript : '')
                                                                .filter(transcript => transcript !== '')
                                                            : [];
                        setResultContext(resultTexts);
                    }
                }

                recognition.onend = () => {
                    if (newRecorder.state !== 'inactive') {
                        newRecorder.stop();
                    }
                    setRecording(false);
                };

            })
            .catch(err => {
                console.error('Error getting user media:', err);
            });

        return () => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            // クリーンアップ
            window.removeEventListener('resize', resizeCanvas);
            animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
            canvasRef.current && canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            analyserRef.current && analyserRef.current.disconnect();
        };
    }, []);

    const handleRecording = () => {
        console.log("clicked:", mediaRecorderRef.current, mediaRecorder);

        if (mediaRecorderRef.current && mediaRecorder) {
            if (!recording && mediaRecorder.state === 'inactive') {
                setResultContext(undefined);
                setAudioURL(undefined);
                mediaRecorder.start();
                setRecording(true);
            } else if (recording && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                resultContext && props.onResult(resultContext)
                audioURL && props.onRecorded(audioURL);
                setRecording(false);
            }
        }
    };

    return (
        <>
            <div id='voice_dialog' className='fixed z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-[50px] py-[25px] min-w-[250px] max-w-[350px] mx-auto w-[80%] h-[450px] bg-white rounded-sm'>
                <div id='modal' className='h-full w-full relative flex flex-col'>
                    <div id='visualizer_wrapper' className='relative h-[80%]'>
                        <canvas id='vu' className='top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-auto absolute' ref={canvasRef}></canvas>
                    </div>
                    <div className='flex h-[20%] gap-2 item-cente flex-col'>
                        <p className='font-semibold text-slate-400 text-base mb-1 text-center'>{recording ? "Recording..." : "Pausing"}</p>
                        <button className='w-fit mx-auto' onClick={handleRecording}>
                            {recording ? '録音停止' : '録音開始'}
                        </button>
                    </div>
                </div>
            </div>
            <div
                className="fixed bg-black top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-30 w-screen h-screen z-10"
                onClick={() => props.toggle()}
            ></div>
        </>
    );
};
