import React from 'react';
import { Button } from 'antd';
import teamMember1 from '../../../assets/images/home-page/team-member-1.png';
import teamMember2 from '../../../assets/images/home-page/team-member-2.png';
import teamMember3 from '../../../assets/images/home-page/team-member-3.png';

interface TeamSectionProps { }

const TeamSection: React.FC<TeamSectionProps> = () => {
    return (
        <div className="py-12 bg-blue-100">
            <div className="container mx-auto px-4 text-center">
                <div className="flex items-center justify-center mb-4">
                    <div className="flex -space-x-4">
                        <img
                            src={teamMember1}
                            alt="Thành viên đội ngũ"
                            className="w-12 h-12 rounded-full border-2 border-white object-cover"
                        />
                        <img
                            src={teamMember2}
                            alt="Thành viên đội ngũ"
                            className="w-12 h-12 rounded-full border-2 border-white object-cover"
                        />
                        <img
                            src={teamMember3}
                            alt="Thành viên đội ngũ"
                            className="w-12 h-12 rounded-full border-2 border-white object-cover"
                        />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Vẫn còn thắc mắc?</h3>
                <p className="text-gray-700 mb-4">
                    Không tìm thấy câu trả lời bạn đang tìm kiếm? Vui lòng trò chuyện với đội ngũ thân thiện của chúng tôi.
                </p>
                <Button type="primary" className="bg-blue-600">
                    Liên hệ với chúng tôi
                </Button>
            </div>
        </div>
    );
};

export default TeamSection; 