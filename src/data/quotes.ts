import { ScriptureQuote } from '../types.ts';

export const SCRIPTURE_QUOTES: ScriptureQuote[] = [
  {
    id: 1,
    quote: "Hãy hiếu kính cha mẹ ngươi, hầu cho ngươi được sống lâu trên đất mà Giê-hô-va Đức Chúa Trời ban cho ngươi.",
    source: "Xuất Ê-díp-tô Ký 20:12",
    reflection: "Lòng hiếu thảo với đấng sinh thành là cội nguồn của mọi phước lành và sự an lạc dài lâu trong cuộc sống."
  },
  {
    id: 2,
    quote: "Kẻ con khôn ngoan làm cho cha vui mừng, nhưng đứa con ngu muội khinh bỉ mẹ mình.",
    source: "Châm Ngôn 15:20",
    reflection: "Hạnh phúc lớn nhất của cha mẹ là nhìn thấy con cháu sống ngay thẳng, trí tuệ và biết quý trọng gia đình."
  },
  {
    id: 3,
    quote: "Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra. Một lòng thờ mẹ kính cha, cho tròn chữ hiếu mới là đạo con.",
    source: "Ca dao truyền thống Việt Nam",
    reflection: "Biết ơn tổ tiên, tưởng nhớ người đã khuất chính là giữ trọn đạo nghĩa muôn đời của người phương Đông."
  },
  {
    id: 4,
    quote: "Hỡi những kẻ mệt mỏi và gánh nặng, hãy đến cùng ta, ta sẽ cho các ngươi được yên nghỉ.",
    source: "Ma-thi-ơ 11:28",
    reflection: "Khi lòng lắng lại trước làn hương trầm, mọi phiền muộn lo toan sẽ tan biến, nhường chỗ cho sự bình yên sâu lắng."
  },
  {
    id: 5,
    quote: "Lòng bình an là sự sống của thể xác, sự ghen ghét là mục nát của xương cốt.",
    source: "Châm Ngôn 14:30",
    reflection: "Giữ tâm thanh tịnh, hướng lòng về điều thiện lành sẽ nuôi dưỡng sức khỏe tinh thần và thể chất."
  },
  {
    id: 6,
    quote: "Sự sáng của ngươi hãy soi trước mặt người ta như vậy, đặng họ thấy những việc lành của các ngươi.",
    source: "Ma-thi-ơ 5:16",
    reflection: "Mỗi nén hương dâng lên là một lời hứa sống tốt đẹp, đem yêu thương sưởi ấm cho người xung quanh."
  },
  {
    id: 7,
    quote: "Cây có cội mới trổ cành xanh lá, nước có nguồn mới biển cả sông sâu. Người ta sinh trưởng bởi đâu? Gốc là tổ phụ, ơn sâu sánh trời.",
    source: "Lời dạy Gia Huấn",
    reflection: "Tưởng nhớ cội nguồn gia tiên là điểm tựa tâm linh vững chãi nhất cho mỗi bước đi trong đời."
  },
  {
    id: 8,
    quote: "Nguyện Chúa ban phước cho ngươi và gìn giữ ngươi; Nguyện Chúa soi sáng mặt Ngài trên ngươi và làm ơn cho ngươi.",
    source: "Dân Số Ký 6:24-25",
    reflection: "Cầu chúc cho gia đạo êm ấm, thân tâm an lạc, tai qua nạn khỏi và vạn sự cát tường."
  },
  {
    id: 9,
    quote: "Tình yêu thương hay nhịn nhục; tình yêu thương hay nhân từ; tình yêu thương chẳng ghen tị, chẳng khoe mình.",
    source: "1 Cô-rinh-tô 13:4",
    reflection: "Lấy tình yêu thương và sự nhẫn nại làm kim chỉ nam để gia đình luôn hòa thuận và ấm êm."
  }
];

export function getTodayQuote(): ScriptureQuote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return SCRIPTURE_QUOTES[dayOfYear % SCRIPTURE_QUOTES.length];
}
