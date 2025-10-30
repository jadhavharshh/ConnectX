const RightSide = () => {
  return (
    <div className="hidden lg:flex flex-1 w-full max-h-full max-w-4000px overflow-hidden relative bg-[#f1f1e8]  dark:bg-[#131313] flex-col pt-10 pl-24 gap-3">
      <h2 className="text-start md:text-4xl font-bold">
        Hi , Welcome to ConnectX.
      </h2>
      <p className="text-start md:text-sm mb-10">
        Experience an innovative LMS with integrated realtime chat, <br />
        empowering your college learning experience.

      </p>
      <img
        src="/images/app-ui.png"
        alt="app image"
        loading="lazy"
        sizes="30"
        className="absolute shrink-0 !w-[1600px] top-48"
        width={0}
        height={0}
      />
    </div>
  )
}

export default RightSide