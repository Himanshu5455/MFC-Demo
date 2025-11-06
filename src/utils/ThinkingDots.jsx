const ThinkingDots = () => {
  const dotStyle = {
    width: "8px",
    height: "8px",
    margin: "0 3px",
    backgroundColor: "#999",
    borderRadius: "50%",
    display: "inline-block",
    animation: "blink 1.4s infinite both",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "left",
        alignItems: "center",
        height: "24px",
        paddingLeft: "20px",
      }}
    >
      <style>
        {`
        @keyframes blink {
          0% { opacity: 0.2; transform: translateY(0); }
          20% { opacity: 1; transform: translateY(-3px); }
          100% { opacity: 0.2; transform: translateY(0); }
        }
      `}
      </style>
      <span style={{ ...dotStyle, animationDelay: "0s" }}></span>
      <span style={{ ...dotStyle, animationDelay: "0.2s" }}></span>
      <span style={{ ...dotStyle, animationDelay: "0.4s" }}></span>
    </div>
  );
};

export default ThinkingDots;
