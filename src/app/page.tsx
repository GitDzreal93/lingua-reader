import { Reader } from '@/components/Reader';
import { Header } from '@/components/Header';

// 示例数据
const sampleData = {
  en: [
    'Suddenly, his vision blurred, and then a strong gust of wind hit his face.',
    'Without time to think, 陈琮 exerted force on his arm and swung his backpack out with all his might.',
    'The backpack and the woman collided heavily in mid - air. The woman let out a most unpleasant screech. She was knocked flying. When she landed, her arms flapped (陈琮 didn\'t know why the word \'flapped\' popped into his head), and then she scurried away quickly towards the end of the aisle.',
    'The commotion was so loud that the others in the same compartment couldn\'t have failed to notice. However, they had been sleeping soundly before. When they suddenly woke up, they only saw the end of the incident, and for a moment they were all a bit dazed.',
    'The young man stopped mid - yawn and stammered, \'Was that... a cat just now?\'',
    'Someone in the middle bunk retorted, \'Can a cat be that big? It was a dog, a big one!\''
  ],
  zh: [
    '眼前蓦然一花，旋即劲风扑面。',
    '陈琮不及细想，臂腕发力，将背包狠狠抡出。',
    '人包于半空重重相撞，女人喉咙里发出一声极难听的怪叫，整个人被撞飞出去，落地时双臂一个扑腾（陈琮也不知道自己脑子里是否会冒出"扑腾"这个词），向着过道深处急窜而去。',
    '动静这么大，同一隔间的其它人不可能不惊觉，只不过他们先前都睡得死沉，突然惊醒，看到的已是事件尾声，一时都有点茫然。',
    '小青年呵欠打了一半，结结巴巴："刚那…… 是猫吗？"',
    '中铺有人反驳："猫能有那么大个头？是狗，大狗！"'
  ],
  words: [
    'blurred: 模糊的',
    'gust: 一阵强风',
    'exert: 施加',
    'screech: 尖叫',
    'scurry: 急匆匆地跑',
    'commotion: 喧闹，骚动',
    'dazed: 茫然的，头晕目眩的',
    'stammer: 结巴，口吃',
    'retort: 反驳'
  ]
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8">
        <Reader data={sampleData} />
      </div>
    </div>
  );
}
