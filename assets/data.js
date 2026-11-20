/* ==========================================================
   人格抽卡机 · 内容库
   9 型文案 + 3 道题 + 合盘规则
   所有文案为行为倾向描述，不构成心理诊断。
   ========================================================== */
(function () {
  "use strict";

  var TYPES = [
    {
      id: 1,
      core: "把事做对",
      code: "01",
      name: "完美型",
      nick: "校准师",
      en: "THE CALIBRATOR",
      color: "#C0503C",
      tagline: "你不是挑剔，你只是看见了那个 0.5 毫米的偏差。",
      powers: ["一眼看见哪里不对", "说到做到的执行力", "把混乱变成标准"],
      mines: ["被说“差不多就行”", "犯错被当场点破", "别人不守规则"],
      partner: "7 号（帮你松一口气）｜2 号（接住你的自责）",
      advice: "今天允许一件事“完成就好”，不修第三遍。",
      share: "我不是挑剔，我只是看见了那个 0.5 毫米的偏差。",
      report: [
        "你默认世界有一个“正确版本”，而你的任务是把它校准回来。所以你很难对“差不多”满意——那不是苛刻，是你真的看见了别人没看见的偏差。",
        "压力大的时候，你会从“想做好”滑向“必须完美”：反复检查、说话变冲、先批评再安慰，最后连自己也不放过。",
        "别人常把你读成“难相处”，其实你只是把标准先放在了自己身上；你对自己的挑剔，通常比对他人的多十倍。",
        "挑一件小事，只做一遍就交出去，然后观察：世界没有塌。"
      ]
    },
    {
      id: 2,
      core: "被需要",
      code: "02",
      name: "助人型",
      nick: "补给站",
      en: "THE SUPPLY",
      color: "#C4694A",
      tagline: "你一直在给别人递水，今天想有人问你渴不渴。",
      powers: ["读到别人没说出口的需要", "让人瞬间放松", "记得所有细节"],
      mines: ["付出被当成理所当然", "被说“你别管了”", "自己开口求助"],
      partner: "8 号（替你撑腰）｜5 号（不消耗你）",
      advice: "今天先问自己“我想不想”，再问“他需不需要”。",
      share: "我一直在给别人递水，今天想有人问我渴不渴。",
      report: [
        "你天生能读到别人没说出口的需要，并且会本能地伸手。被需要让你确认自己的位置，这没什么可羞耻的。",
        "累的时候你不会说累，会做得更多：替所有人安排、记得所有人的口味，然后在没人问你要不要的时候突然委屈。",
        "别人以为你“没有边界”，其实你只是把边界让给了关系；你真正想要的，是付出被看见，而不是被依赖。",
        "今天先问自己一句“我想不想”，再问“他需不需要”。顺序换一下，答案会不一样。"
      ]
    },
    {
      id: 3,
      core: "被看见",
      code: "03",
      name: "成就型",
      nick: "推进器",
      en: "THE THRUSTER",
      color: "#B08A2E",
      tagline: "我擅长赢，但最近在学怎么输得体面。",
      powers: ["把目标拆成路径", "临场永远能打", "学什么都快"],
      mines: ["被说“你只是运气好”", "无意义的社交", "失败被公开"],
      partner: "9 号（让你慢下来）｜6 号（帮你兜底）",
      advice: "今天做一件没有成绩、也不发朋友圈的事。",
      share: "我擅长赢，但最近在学怎么输得体面。",
      report: [
        "你相信价值是被做出来的，于是不断给自己设目标、找赛道、拿结果。停下来会让你怀疑自己是否还存在。",
        "压力下你会加速：接更多事、把日程塞满、用忙碌回避“我到底想要什么”这个问题。",
        "别人觉得你“只在乎成绩”，其实你在乎的是被认真对待；你怕的不是失败，是失败之后没人再看见你。",
        "今天做一件没有成绩、也不发朋友圈的事，只为自己。"
      ]
    },
    {
      id: 4,
      core: "被真正理解",
      code: "04",
      name: "自我型",
      nick: "深海观测员",
      en: "THE OBSERVER",
      color: "#6C5FA0",
      tagline: "我不是难懂，我只是还没遇到愿意慢一点的人。",
      powers: ["审美直觉", "很深的共情", "把感受说得很准"],
      mines: ["被说“你想太多”", "被拿去和别人比较", "敷衍的回应"],
      partner: "5 号（不评判）｜9 号（稳定，不追问）",
      advice: "把“我不一样”写成一件具体的小事，比如你喜欢的那个奇怪配色。",
      share: "我不是难懂，我只是还没遇到愿意慢一点的人。",
      report: [
        "你对“真”和“美”有超出常人的敏感，也一直在确认一件事：我是不是独一无二的，会不会被真正理解。",
        "压力下你会往里沉：反复咀嚼一句话、把普通的失落写成命运、推开人又希望被追回来。",
        "别人说你“情绪化”，其实你只是感受的像素比别人高；你不是要戏剧性，你要的是被准确地接住。",
        "把“我不一样”写成一件具体的小事，比如你喜欢的那个奇怪配色。具体，是抵抗空转的解药。"
      ]
    },
    {
      id: 5,
      core: "想明白",
      code: "05",
      name: "理智型",
      nick: "资料库",
      en: "THE ARCHIVE",
      color: "#4E7585",
      tagline: "我不是冷漠，我是在后台加载。",
      powers: ["看透事情的结构", "情绪稳定", "自给自足"],
      mines: ["被突然打断", "被索取情绪", "没准备好就要表态"],
      partner: "2 号（给温度）｜8 号（替你出面）",
      advice: "今天把想法说出 30% 就好，别等它变成完美版本。",
      share: "我不是冷漠，我是在后台加载。",
      report: [
        "你靠理解世界来获得安全：先弄懂，再参与；先储备，再开口。独处不是逃避，是你的充电方式。",
        "压力下你会关机：减少回应、退回信息里、用“我再想想”拖住所有需要表态的时刻。",
        "别人以为你冷，其实你只是把情绪放在了后台运行；你的热情通常以“我帮你查了资料”的形式出现。",
        "今天把想法说出 30% 就好，别等它在你脑子里变成完美版本。"
      ]
    },
    {
      id: 6,
      core: "确定感",
      code: "06",
      name: "忠诚型",
      nick: "预警雷达",
      en: "THE RADAR",
      color: "#55738F",
      tagline: "我不是想太多，我是在替大家想。",
      powers: ["提前看见风险", "忠诚到最后一刻", "永远有人兜底"],
      mines: ["临时改计划", "信息不透明", "被逼立刻决定"],
      partner: "3 号（带你往前）｜9 号（稳住你）",
      advice: "把最坏的情况写下来，写到具体——你会发现它是有边界的。",
      share: "我不是想太多，我是在替大家想。",
      report: [
        "你的大脑默认在跑风险模拟：如果 A 出错怎么办，如果 B 反悔怎么办。这不是悲观，是你在替所有人兜底。",
        "压力下你会反复确认：问同一个问题三遍、预演最坏的结局、对临时变动格外烦躁。",
        "别人觉得你“想太多”，其实你只是比别人早三步看到坑；你需要的是信息透明，不是安慰。",
        "把最坏的情况写下来，写到具体。你会发现它是有边界的，而边界之外的地方，可以先走一步。"
      ]
    },
    {
      id: 7,
      core: "可能性",
      code: "07",
      name: "活跃型",
      nick: "烟花发射器",
      en: "THE FIREWORK",
      color: "#C97F2E",
      tagline: "我同时开了 7 个窗口，其中 6 个在放烟花。",
      powers: ["点子密度极高", "三秒拉满气氛", "快速回血"],
      mines: ["被限制自由", "重复且无聊", "被迫面对沉重情绪"],
      partner: "1 号（帮你收尾）｜4 号（陪你深一点）",
      advice: "今天把一件事做到第 3 步再换，就 3 步。",
      share: "我同时开了 7 个窗口，其中 6 个在放烟花。",
      report: [
        "你靠可能性活着：新点子、新地方、新的人。痛苦来的时候，你的第一反应是再开一个窗口。",
        "压力下你会逃向热闹：疯狂安排、同时开很多事、用“都挺好”盖住不想面对的部分。",
        "别人说你“不靠谱”，其实你只是不愿意被一件事定义；你真正怕的，是停下来之后那种空。",
        "今天把一件事做到第 3 步再换，就 3 步。做到第 3 步，你会尝到另一种爽。"
      ]
    },
    {
      id: 8,
      core: "掌控",
      code: "08",
      name: "领袖型",
      nick: "承重墙",
      en: "THE PILLAR",
      color: "#9E3E3E",
      tagline: "我可以扛，但我也想有人问我累不累。",
      powers: ["关键时刻的决断", "护住身边的人", "压力越大越稳"],
      mines: ["被当众挑战", "被人控制", "看到不公平"],
      partner: "2 号（软化你）｜5 号（给你方案）",
      advice: "今天先说“我需要什么”，再说“应该怎么做”。",
      share: "我可以扛，但我也想有人问我累不累。",
      report: [
        "你相信力量是用来保护人的，也相信失控意味着受伤。所以你习惯先站出来、先扛、先做决定。",
        "压力下你会加码：声音变大、话说变硬、把“我需要”翻译成“你应该”。",
        "别人怕你，其实你只是不想再被伤害；你强硬的外壳下面，通常藏着一个没被好好照顾的小孩。",
        "今天先说“我需要什么”，再说“应该怎么做”。顺序换一下，别人才接得住你。"
      ]
    },
    {
      id: 9,
      core: "和谐",
      code: "09",
      name: "和平型",
      nick: "恒温器",
      en: "THE THERMOSTAT",
      color: "#667F51",
      tagline: "我不是没意见，我只是把意见调成了静音。",
      powers: ["稳定全场", "调和矛盾", "让人安心"],
      mines: ["被逼当场表态", "冲突现场", "被彻底忽视"],
      partner: "3 号（推你一把）｜8 号（替你出头）",
      advice: "今天说一次“我不同意”，哪怕只是选哪家外卖。",
      share: "我不是没意见，我只是把意见调成了静音。",
      report: [
        "你天生会读空气，知道怎么让一个房间舒服。冲突让你不适，于是你把意见调成静音，把节奏交给别人。",
        "压力下你会消失：拖延、含糊、说“都行”，用不选择来避免冲突。",
        "别人以为你没主见，其实你只是把力气花在了维持和平上；你的沉默里有一整套没被听见的判断。",
        "今天说一次“我不同意”，哪怕只是选哪家外卖。音量小没关系，说出来就行。"
      ]
    }
  ];

  /* 3 道题，每题 5 个选项。primary 计 2 分，secondary 计 1 分 */
  var QUESTIONS = [
    {
      q: "走进一个全是陌生人的房间，你先做什么？",
      hint: "选最像你第一反应的那个，不要选“应该”的。",
      options: [
        { label: "先观察，谁值得信任", primary: 6, secondary: 5 },
        { label: "想清楚自己为什么在这", primary: 5, secondary: 4 },
        { label: "找个同频的人聊起来", primary: 4, secondary: 9 },
        { label: "先把气氛带起来", primary: 7, secondary: 3 },
        { label: "找个角落，等别人来找我", primary: 9, secondary: 2 }
      ]
    },
    {
      q: "做决定的时候，你最怕什么？",
      hint: "怕的那个东西，往往就是你真正的动机。",
      options: [
        { label: "做错，显得不够好", primary: 1, secondary: 6 },
        { label: "错过，机会就没了", primary: 7, secondary: 3 },
        { label: "不被理解，没人站在我这边", primary: 4, secondary: 2 },
        { label: "失控，被人拿捏", primary: 8, secondary: 5 },
        { label: "起冲突，关系变差", primary: 9, secondary: 2 }
      ]
    },
    {
      q: "你最希望别人怎么评价你？",
      hint: "不是别人真的怎么评价，是你最想听到的那句。",
      options: [
        { label: "靠谱，值得托付", primary: 6, secondary: 1 },
        { label: "有本事，能扛事", primary: 3, secondary: 8 },
        { label: "特别，有品味", primary: 4, secondary: 3 },
        { label: "温暖，会照顾人", primary: 2, secondary: 9 },
        { label: "聪明，看得透", primary: 5, secondary: 1 }
      ]
    }
  ];

  /* 9 题精测版：每型至少出现一次，覆盖更多场景 */
  var FULL_QUESTIONS = [
    {
      q: "走进一个全是陌生人的房间，你先做什么？",
      hint: "选最像你第一反应的那个，不要选“应该”的。",
      options: [
        { label: "先看这里谁说了算、什么规矩", primary: 6, secondary: 1 },
        { label: "先让自己被看见、被记住", primary: 3, secondary: 7 },
        { label: "先找到同频的人聊起来", primary: 4, secondary: 9 },
        { label: "先照顾那个落单的人", primary: 2, secondary: 9 },
        { label: "先找个角落，把情况摸清楚", primary: 5, secondary: 6 }
      ]
    },
    {
      q: "做决定的时候，你最怕什么？",
      hint: "怕的那个东西，往往就是你真正的动机。",
      options: [
        { label: "做错，显得不够好", primary: 1, secondary: 6 },
        { label: "错过，机会就没了", primary: 7, secondary: 3 },
        { label: "不被理解，没人站在我这边", primary: 4, secondary: 2 },
        { label: "失控，被人拿捏", primary: 8, secondary: 5 },
        { label: "起冲突，关系变差", primary: 9, secondary: 2 }
      ]
    },
    {
      q: "被当众指出错误，你的第一反应是？",
      hint: "第一反应，不是事后反思出来的那个。",
      options: [
        { label: "先认，回去再反复复盘", primary: 1, secondary: 6 },
        { label: "先解释清楚，别让人误会", primary: 6, secondary: 3 },
        { label: "表面没事，心里难受很久", primary: 4, secondary: 9 },
        { label: "先判断他说得对不对，对就改", primary: 5, secondary: 1 },
        { label: "有点火，想把话说清楚", primary: 8, secondary: 7 }
      ]
    },
    {
      q: "朋友遇到麻烦，你通常会？",
      hint: "",
      options: [
        { label: "直接给方案，帮他分析", primary: 5, secondary: 1 },
        { label: "先陪着，问他需要什么", primary: 2, secondary: 9 },
        { label: "替他出头，把事摆平", primary: 8, secondary: 3 },
        { label: "想办法让他先开心起来", primary: 7, secondary: 2 },
        { label: "提醒他所有可能的风险", primary: 6, secondary: 5 }
      ]
    },
    {
      q: "压力最大的时候，你会？",
      hint: "不是你想成为的样子，是你实际会做的事。",
      options: [
        { label: "加班、检查、反复修改", primary: 1, secondary: 3 },
        { label: "消失一阵，谁也不想理", primary: 5, secondary: 4 },
        { label: "疯狂安排，把日程塞满", primary: 7, secondary: 3 },
        { label: "先扛住，谁也不说", primary: 8, secondary: 2 },
        { label: "拖延、刷手机、假装没事", primary: 9, secondary: 7 }
      ]
    },
    {
      q: "你最希望别人怎么评价你？",
      hint: "不是别人真的怎么评价，是你最想听到的那句。",
      options: [
        { label: "靠谱，值得托付", primary: 6, secondary: 1 },
        { label: "温暖，会照顾人", primary: 2, secondary: 9 },
        { label: "有本事，能扛事", primary: 3, secondary: 8 },
        { label: "特别，有品味", primary: 4, secondary: 3 },
        { label: "聪明，看得透", primary: 5, secondary: 1 }
      ]
    },
    {
      q: "两个朋友吵起来，你在场，你会？",
      hint: "",
      options: [
        { label: "先把他们分开，别升级", primary: 8, secondary: 1 },
        { label: "当和事佬，各退一步", primary: 9, secondary: 2 },
        { label: "私下分别听，帮他们翻译", primary: 4, secondary: 2 },
        { label: "讲道理，把事实摆清楚", primary: 5, secondary: 1 },
        { label: "换个话题，先把气氛带过去", primary: 7, secondary: 6 }
      ]
    },
    {
      q: "难得的休息日，你最想？",
      hint: "",
      options: [
        { label: "把拖了很久的事做完", primary: 3, secondary: 1 },
        { label: "谁也别找我，一个人待着", primary: 5, secondary: 4 },
        { label: "约人出去玩，越热闹越好", primary: 7, secondary: 3 },
        { label: "陪家人朋友，照顾他们", primary: 2, secondary: 9 },
        { label: "睡到自然醒，什么都不安排", primary: 9, secondary: 5 }
      ]
    },
    {
      q: "你最怕听到哪句话？",
      hint: "哪一句会让你心里“咯噔”一下。",
      options: [
        { label: "“你怎么连这个都做不好”", primary: 1, secondary: 3 },
        { label: "“你太自私了”", primary: 2, secondary: 9 },
        { label: "“你不行”", primary: 3, secondary: 8 },
        { label: "“没人真的懂你”", primary: 4, secondary: 6 },
        { label: "“随便你吧”", primary: 9, secondary: 8 }
      ]
    }
  ];

  /* 合盘规则：把两型的关系归成 4 类，再给一句判词 */
  var PAIR_RULES = {
    same: {
      title: "照镜子",
      line: "你们太像了，好起来是双倍默契，卡住时是双倍死角。",
      tip: "约定一个“暂停词”，谁先情绪上头谁喊停。"
    },
    complement: {
      title: "互补体",
      line: "你缺的那块，正好长在他身上；但也正因为如此，他最容易踩到你的雷。",
      tip: "把分工说清楚：谁负责踩油门，谁负责踩刹车。"
    },
    stretch: {
      title: "拉扯感",
      line: "你们的默认节奏不一样，一个想快进，一个想缓冲，误会大多来自节奏而不是心意。",
      tip: "重要的话说两遍：一遍讲事实，一遍讲感受。"
    },
    steady: {
      title: "稳定器",
      line: "不算火花四溅，但很难散场。你们给彼此的是“不用表演也能待着”的安全感。",
      tip: "偶尔主动制造一点新鲜事，别让稳定变成省略。"
    }
  };

  var PAIRS = {
    "1-2": "complement", "1-3": "stretch", "1-4": "stretch", "1-5": "steady",
    "1-6": "steady", "1-7": "complement", "1-8": "stretch", "1-9": "complement",
    "2-3": "complement", "2-4": "stretch", "2-5": "steady", "2-6": "steady",
    "2-7": "complement", "2-8": "complement", "2-9": "steady",
    "3-4": "stretch", "3-5": "stretch", "3-6": "complement", "3-7": "stretch",
    "3-8": "steady", "3-9": "complement",
    "4-5": "complement", "4-6": "stretch", "4-7": "complement", "4-8": "stretch",
    "4-9": "steady",
    "5-6": "steady", "5-7": "stretch", "5-8": "complement", "5-9": "steady",
    "6-7": "stretch", "6-8": "steady", "6-9": "complement",
    "7-8": "complement", "7-9": "complement",
    "8-9": "complement"
  };

  window.GACHA_DATA = {
    types: TYPES,
    questions: QUESTIONS,
    full: FULL_QUESTIONS,
    pairRules: PAIR_RULES,
    pairs: PAIRS
  };
})();
