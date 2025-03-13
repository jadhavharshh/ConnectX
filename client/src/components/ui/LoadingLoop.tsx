import SyncLoader from "react-spinners/SyncLoader"

const LoadingLoop = () => {
  return (
<div className='flex flex-col h-screen w-screen bg-black items-center justify-center'>
    <SyncLoader
      color="#ffffff"
      size={20}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  </div>
  )
}

export default LoadingLoop