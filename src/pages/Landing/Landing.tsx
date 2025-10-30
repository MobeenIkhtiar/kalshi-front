import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="w-screen h-screen overflow-hidden flex flex-col px-4" style={{ background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)' }}>
			<div className="flex-1 w-full flex items-center justify-center">
				<div className="max-w-3xl text-center">
					<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
						Unlock The Power Of
						<br />
						<span className="block mt-2">Prediction Market</span>
					</h1>
					<p className="text-gray-300 mb-8 leading-relaxed">
						Gain insights into market trends and make informed decisions with our advanced analytics platform.
					</p>
					<button
						onClick={() => navigate('/login')}
						className="px-8 cursor-pointer py-3 rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors min-w-[260px]"
					>
						Connect Kalshi Account
					</button>
				</div>
			</div>
			<div className="w-full text-center pb-6">
				<p className="text-gray-400 text-xs">© 2025 Prediction Market Analytics. All rights reserved.</p>
			</div>
		</div>
	);
};

export default Landing;
