const Spacer = ({
	size,
	horizontal,
}) => {
	size = size || 4;
	horizontal = horizontal || false;
	const w = horizontal ? 'w' : 'h';
	const h = horizontal ? 'h' : 'w';
	const ws = `${w}-${size}`;
	const hs = `${h}-full`;
	return <div className={`${ws} ${hs}`} />;
};
export default Spacer;
