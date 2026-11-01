// 15 Curated Placement Test Questions spanning A1 to C2
// Used to estimate the learner's initial English proficiency level.

export const PLACEMENT_QUESTIONS = [
  // Question 1 (A1)
  {
    id: 'pq_01',
    level: 'A1',
    questionEn: 'Choose the correct greeting for 8:00 AM:',
    questionVi: 'Chọn lời chào đúng vào lúc 8 giờ sáng:',
    options: [
      { textEn: 'Good morning', textVi: 'Chào buổi sáng' },
      { textEn: 'Good evening', textVi: 'Chào buổi tối' },
      { textEn: 'Good night', textVi: 'Chúc ngủ ngon' },
      { textEn: 'Goodbye', textVi: 'Tạm biệt' },
    ],
    correctIndex: 0,
    explanationVi: '8:00 AM là buổi sáng nên lời chào chuẩn mực là "Good morning".'
  },
  // Question 2 (A1)
  {
    id: 'pq_02',
    level: 'A1',
    questionEn: 'She _______ to school every day by bicycle.',
    questionVi: 'Cô ấy _______ đến trường mỗi ngày bằng xe đạp.',
    options: [
      { textEn: 'go', textVi: 'đi (dạng nguyên thể)' },
      { textEn: 'goes', textVi: 'đi (thì hiện tại đơn ngôi thứ 3 số ít)' },
      { textEn: 'going', textVi: 'đang đi' },
      { textEn: 'gone', textVi: 'đã đi (phân từ 2)' },
    ],
    correctIndex: 1,
    explanationVi: 'Chủ ngữ ngôi thứ ba số ít "She" ở thì hiện tại đơn thường nhật đi với "goes".'
  },
  // Question 3 (A2)
  {
    id: 'pq_03',
    level: 'A2',
    questionEn: 'I am looking forward _______ your birthday party this Saturday.',
    questionVi: 'Tôi rất mong đợi _______ bữa tiệc sinh nhật của bạn vào thứ Bảy này.',
    options: [
      { textEn: 'to attend', textVi: 'để tham dự (to + V)' },
      { textEn: 'to attending', textVi: 'việc tham dự (to + V-ing)' },
      { textEn: 'at attending', textVi: 'tại việc tham dự' },
      { textEn: 'for attend', textVi: 'cho việc tham dự' },
    ],
    correctIndex: 1,
    explanationVi: 'Cấu trúc "look forward to + V-ing/Noun" nghĩa là háo hức mong đợi điều gì.'
  },
  // Question 4 (A2)
  {
    id: 'pq_04',
    level: 'A2',
    questionEn: 'Yesterday was cold, so I stayed inside and _______ hot chocolate.',
    questionVi: 'Hôm qua trời lạnh, nên tôi ở trong nhà và _______ sô-cô-la nóng.',
    options: [
      { textEn: 'drank', textVi: 'đã uống (quá khứ đơn)' },
      { textEn: 'drink', textVi: 'uống (hiện tại)' },
      { textEn: 'drunk', textVi: 'uống (phân từ)' },
      { textEn: 'drinks', textVi: 'uống (ngôi thứ 3)' },
    ],
    correctIndex: 0,
    explanationVi: 'Câu kể về quá khứ ("Yesterday"), quá khứ của động từ bất quy tắc "drink" là "drank".'
  },
  // Question 5 (A2)
  {
    id: 'pq_05',
    level: 'A2',
    questionEn: 'What does "raining cats and dogs" mean?',
    questionVi: 'Cụm thành ngữ "raining cats and dogs" có nghĩa là gì?',
    options: [
      { textEn: 'Animals are falling from the sky', textVi: 'Động vật rơi từ trên trời xuống' },
      { textEn: 'It is raining extremely heavily', textVi: 'Trời đang mưa rất to như trút nước' },
      { textEn: 'A light, pleasant shower', textVi: 'Một cơn mưa rào nhẹ nhàng' },
      { textEn: 'Sunny and windy weather', textVi: 'Thời tiết nắng ráo và có gió' },
    ],
    correctIndex: 1,
    explanationVi: '"Raining cats and dogs" là thành ngữ miêu tả cơn mưa xối xả, mưa tầm tã.'
  },
  // Question 6 (B1)
  {
    id: 'pq_06',
    level: 'B1',
    questionEn: 'They had to _______ the flight because of a severe thunderstorm.',
    questionVi: 'Họ đã buộc phải _______ chuyến bay vì một cơn giông bão dữ dội.',
    options: [
      { textEn: 'call off', textVi: 'hủy bỏ' },
      { textEn: 'call up', textVi: 'gọi điện thoại' },
      { textEn: 'take after', textVi: 'trông giống ai' },
      { textEn: 'put on', textVi: 'mặc vào' },
    ],
    correctIndex: 0,
    explanationVi: '"Call off" là cụm động từ tương đương "cancel" (hủy bỏ một kế hoạch hay sự kiện).'
  },
  // Question 7 (B1)
  {
    id: 'pq_07',
    level: 'B1',
    questionEn: 'If I _______ more free time, I would travel around Southeast Asia.',
    questionVi: 'Nếu tôi _______ nhiều thời gian rảnh hơn, tôi sẽ đi du lịch khắp Đông Nam Á.',
    options: [
      { textEn: 'have', textVi: 'có (hiện tại)' },
      { textEn: 'had', textVi: 'có (quá khứ - câu điều kiện loại 2)' },
      { textEn: 'will have', textVi: 'sẽ có' },
      { textEn: 'had had', textVi: 'đã có (quá khứ hoàn thành)' },
    ],
    correctIndex: 1,
    explanationVi: 'Câu điều kiện loại 2 (giả định trái ngược với hiện tại): If + S + V-ed/past simple, S + would + V.'
  },
  // Question 8 (B1)
  {
    id: 'pq_08',
    level: 'B1',
    questionEn: 'The team successfully _______ an in-depth survey of customer preferences.',
    questionVi: 'Nhóm nghiên cứu đã _______ thành công một cuộc khảo sát chuyên sâu về sở thích khách hàng.',
    options: [
      { textEn: 'carried out', textVi: 'tiến hành, thực hiện' },
      { textEn: 'carried away', textVi: 'cuốn đi, mất tự chủ' },
      { textEn: 'carried over', textVi: 'chuyển sang kỳ sau' },
      { textEn: 'carried on', textVi: 'tiếp tục làm gì' },
    ],
    correctIndex: 0,
    explanationVi: '"Carry out a survey / an experiment" là cụm collocation học thuật chuẩn nghĩa là tiến hành khảo sát.'
  },
  // Question 9 (B2)
  {
    id: 'pq_09',
    level: 'B2',
    questionEn: 'A technology that brings both immense productivity and privacy risks is best described as a:',
    questionVi: 'Một công nghệ vừa mang lại năng suất khổng lồ vừa tiềm ẩn nguy cơ về quyền riêng tư được gọi là:',
    options: [
      { textEn: 'double-edged sword', textVi: 'con dao hai lưỡi' },
      { textEn: 'silver bullet', textVi: 'viên đạn bạc (giải pháp vạn năng)' },
      { textEn: 'drop in the ocean', textVi: 'hạt muối bỏ bể' },
      { textEn: 'blessing in disguise', textVi: 'trong cái rủi có cái may' },
    ],
    correctIndex: 0,
    explanationVi: '"Double-edged sword" miêu tả thứ có thể đem lại cả lợi ích lẫn hiểm họa song hành.'
  },
  // Question 10 (B2)
  {
    id: 'pq_10',
    level: 'B2',
    questionEn: 'Is it economically _______ to construct an underground railway in this swampy terrain?',
    questionVi: 'Liệu về mặt kinh tế có _______ khi xây dựng tuyến đường sắt ngầm ở vùng địa hình đầm lầy này không?',
    options: [
      { textEn: 'feasible', textVi: 'khả thi, có thể thực hiện' },
      { textEn: 'reckless', textVi: 'liều lĩnh, bất cẩn' },
      { textEn: 'superficial', textVi: 'nông cạn, bề nổi' },
      { textEn: 'redundant', textVi: 'dư thừa không cần thiết' },
    ],
    correctIndex: 0,
    explanationVi: '"Feasible" (khả thi) là tính từ chính xác đi với "economically feasible".'
  },
  // Question 11 (C1)
  {
    id: 'pq_11',
    level: 'C1',
    questionEn: 'Corporate directors bear a strict _______ duty to protect the wealth and interests of shareholders.',
    questionVi: 'Hội đồng quản trị doanh nghiệp gánh vác một nghĩa vụ _______ nghiêm ngặt để bảo vệ tài sản và lợi ích của cổ đông.',
    options: [
      { textEn: 'fiduciary', textVi: 'ủy thác pháp lý và đạo đức cao nhất' },
      { textEn: 'trivial', textVi: 'vụn vặt, tầm thường' },
      { textEn: 'arbitrary', textVi: 'tùy tiện, cảm tính' },
      { textEn: 'fleeting', textVi: 'thoáng qua mau chóng' },
    ],
    correctIndex: 0,
    explanationVi: '"Fiduciary duty" là thuật ngữ chuyên ngành luật doanh nghiệp chỉ nghĩa vụ ủy thác trung thành cao nhất.'
  },
  // Question 12 (C1)
  {
    id: 'pq_12',
    level: 'C1',
    questionEn: 'The scientist insisted on providing _______ evidence before making any public claims.',
    questionVi: 'Nhà khoa học kiên quyết yêu cầu phải có bằng chứng _______ trước khi đưa ra bất kỳ tuyên bố công khai nào.',
    options: [
      { textEn: 'empirical', textVi: 'thực nghiệm (thu thập từ thí nghiệm/quan sát)' },
      { textEn: 'anecdotal', textVi: 'truyền miệng, giai thoại vụn vặt' },
      { textEn: 'superstitious', textVi: 'mê tín dị đoan' },
      { textEn: 'hypothetical', textVi: 'thuần túy mang tính giả định' },
    ],
    correctIndex: 0,
    explanationVi: '"Empirical evidence" là bằng chứng thực nghiệm khoa học dựa trên dữ liệu định lượng cụ thể.'
  },
  // Question 13 (C1)
  {
    id: 'pq_13',
    level: 'C1',
    questionEn: 'The recent scandals represent merely the _______ of a deep-seated cultural crisis.',
    questionVi: 'Những vụ bê bối gần đây chỉ đại diện cho _______ của một cuộc khủng hoảng văn hóa thâm căn cố đế.',
    options: [
      { textEn: 'tip of the iceberg', textVi: 'phần nổi của tảng băng chìm' },
      { textEn: 'elephant in the room', textVi: 'vấn đề hiển nhiên mà ai cũng lờ đi' },
      { textEn: 'spill the beans', textVi: 'tiết lộ bí mật' },
      { textEn: 'bite the bullet', textVi: 'cắn răng chịu đựng' },
    ],
    correctIndex: 0,
    explanationVi: '"Tip of the iceberg" diễn tả một biểu hiện nhỏ bên ngoài của một vấn đề khổng lồ còn ẩn giấu bên dưới.'
  },
  // Question 14 (C2)
  {
    id: 'pq_14',
    level: 'C2',
    questionEn: 'Her stirring oration needed no further embellishment; adding melodramatic poetry would merely _______ .',
    questionVi: 'Bài diễn thuyết lay động của cô ấy chẳng cần điểm xuyết thêm gì nữa; thêm vào những vần thơ sướt mướt chỉ là _______ .',
    options: [
      { textEn: 'gild the lily', textVi: 'vẽ rắn thêm chân, tô điểm thừa thãi' },
      { textEn: 'burn bridges', textVi: 'triệt đường lui của chính mình' },
      { textEn: 'break the ice', textVi: 'phá vỡ bầu không khí ngượng ngùng' },
      { textEn: 'hit the nail on the head', textVi: 'nói trúng phóc trọng tâm' },
    ],
    correctIndex: 0,
    explanationVi: '"Gild the lily" là thành ngữ văn học chỉ hành động tô vẽ thừa thãi cho một điều vốn đã quá hoàn hảo.'
  },
  // Question 15 (C2)
  {
    id: 'pq_15',
    level: 'C2',
    questionEn: 'Scholars approaching contradictory epistemological paradigms must cultivate genuine _______ .',
    questionVi: 'Các học giả khi tiếp cận các mô thức nhận thức luận trái chiều cần phải rèn luyện sự _______ thực thụ.',
    options: [
      { textEn: 'epistemic humility', textVi: 'khiêm nhường về nhận thức (thừa nhận giới hạn tri thức)' },
      { textEn: 'dogmatic arrogance', textVi: 'kiêu ngạo giáo điều' },
      { textEn: 'superficial apathy', textVi: 'thờ ơ nông cạn' },
      { textEn: 'unwarranted certainty', textVi: 'sự chắc chắn vô căn cứ' },
    ],
    correctIndex: 0,
    explanationVi: '"Epistemic humility" là khái niệm triết học cao cấp về sự nhận thức khiêm nhường đối với giới hạn của hiểu biết con người.'
  }
];

export function calculateRecommendedLevel(score, total = 15) {
  const percentage = (score / total) * 100;
  if (percentage <= 20) return { level: 'A1', title: 'Beginner (A1)', titleVi: 'Cơ bản - Khởi đầu (A1)' };
  if (percentage <= 40) return { level: 'A2', title: 'Elementary (A2)', titleVi: 'Sơ cấp (A2)' };
  if (percentage <= 60) return { level: 'B1', title: 'Intermediate (B1)', titleVi: 'Trung cấp (B1)' };
  if (percentage <= 75) return { level: 'B2', title: 'Upper-Intermediate (B2)', titleVi: 'Trung cấp nâng cao (B2)' };
  if (percentage <= 90) return { level: 'C1', title: 'Advanced (C1)', titleVi: 'Cao cấp (C1)' };
  return { level: 'C2', title: 'Mastery / Proficiency (C2)', titleVi: 'Thành thạo / Bản ngữ (C2)' };
}
