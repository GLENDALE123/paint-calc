// 번역 초안. 현장 용어(주제·신나·안료 등)는 각 언어 사용자에게 검수 받을 것.
export const LANGS = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'zh', name: '中文' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
]

const ko = {
  tabWork: '작업', tabRecipes: '배합', tabDefects: '차지율',
  back: '뒤로', close: '닫기', cancel: '취소', done: '완료', save: '저장', delete: '삭제', edit: '편집', language: '언어',
  today: '오늘', pcs: '{n}개',
  'type.base': '주제', 'type.gloss': '유광', 'type.matte': '무광', 'type.thinner': '신나', 'type.pigment': '안료', 'type.additive': '첨가제', 'type.other': '기타',
  ask: '무엇을 하시나요?', newMix: '새로 섞기', newMixSub: '빈 통에 처음부터 배합합니다', fix: '섞은 통 보정', fixSub: '이미 섞은 통의 비율을 맞춥니다',
  cans: '섞어 둔 통', fixBtn: '보정', cansFooter: '새로 섞기를 마치면 통이 여기에 저장됩니다. 보정할 때 배합을 다시 입력하지 않아도 됩니다.', canNo: '#{n}',
  pickRecipe: '배합 고르기', noRecipes: '저장된 배합이 없습니다', newRecipe: '새 배합',
  mixStep1: '1단계 · {base} 무게', mixStep2: '2단계 · 순서대로 넣기', ofN: '{n} / {m}',
  pctOfBase: '{base} 대비 {p}%', pctOfMix: '{base}+{thinner} 대비 {p}%', ratioOf: '{base} 1 : {r}',
  totalInCan: '통 전체', mixHint: '넣은 뒤 줄을 누르세요. 무게를 바꾸면 양이 다시 계산됩니다.', finishMix: '완료하고 통 저장', left: '{n}개 남음', enterWeight: '무게를 입력하세요',
  pickCan: '보정할 통', noRecord: '기록 없는 통', noRecordSub: '배합을 고르고 지금 비율을 직접 입력합니다',
  weigh: '통 계량', weighStep1: '1단계 · 통을 저울에 올리세요', scale: '저울 값', tare: '빈 통 무게', tareHint: '빈 통 무게는 다음에도 기억합니다.', remain: '남은 양',
  weighStep2: '2단계 · 지금 통 상태', fromMix: '{time} 섞은 기록', manualState: '직접 입력한 상태', stateHint: '섞을 때 기록에서 가져왔습니다. 다른 것을 더 넣었다면 고치세요.',
  calcAdd: '더 넣을 양 계산', addTitle: '더 넣을 양', addTotal: '총 추가', order: '순서대로 넣기', keep: '안 넣음',
  stuckNote: '덜어낼 수 없는 성분: {names}. 나머지를 늘려 목표에 맞춥니다.', finishFix: '완료하고 저장', nothing: '이미 목표 배합과 같습니다.', targetIs: '목표 배합: {name}',
  currentState: '지금 통 상태',
  recipes: '배합', recipeName: '이름', recipeNamePh: '예: 상도 회색', color: '색', baseType: '기준 재료', materials: '넣을 재료', addMaterial: '재료 추가',
  materialLabel: '이름(선택)', materialLabelPh: '예: 황색', basis: '안료 % 기준', basisBase: '{base}만', basisMix: '{base}+{thinner}',
  outerHint: '%는 {base} 무게 대비(외할)입니다.', thinnerHint: '{thinner}는 {base} 1 : x 비율로 입력합니다.',
  ratioMode: '비율로 입력', totalPct: '총 함유량', parts: '비율', apply: '적용', deleteRecipe: '배합 삭제', confirmDeleteRecipe: '이 배합을 삭제할까요?', confirmDeleteCan: '이 통 기록을 삭제할까요?',
  untitled: '이름 없는 배합', exportAll: '배합 내보내기', importAll: '배합 가져오기', importDone: '배합 {n}개를 가져왔습니다.', importFail: '파일을 읽을 수 없습니다.',
  shareHint: '내보낸 파일을 다른 휴대폰에서 가져오면 같은 배합을 쓸 수 있습니다. 데이터는 이 기기에만 저장됩니다.',
  defectRate: '불량률', ofTotal: '{n}개 중 {m}개', totalQty: '총 수량', itemPh: '항목', count: '개수', addItem: '항목 추가',
  overWarn: '불량 합계가 총 수량보다 많습니다.', defectHint: '막대는 불량 중 차지하는 몫, 오른쪽 숫자는 총 수량 대비 비율입니다.', reset: '초기화',
}

const en = {
  tabWork: 'Work', tabRecipes: 'Recipes', tabDefects: 'Defects',
  back: 'Back', close: 'Close', cancel: 'Cancel', done: 'Done', save: 'Save', delete: 'Delete', edit: 'Edit', language: 'Language',
  today: 'Today', pcs: '{n} pcs',
  'type.base': 'Base', 'type.gloss': 'Gloss', 'type.matte': 'Matte', 'type.thinner': 'Thinner', 'type.pigment': 'Pigment', 'type.additive': 'Additive', 'type.other': 'Other',
  ask: 'What are you doing?', newMix: 'New mix', newMixSub: 'Start from an empty can', fix: 'Fix a mixed can', fixSub: 'Correct the ratio of a can you already mixed',
  cans: 'Mixed cans', fixBtn: 'Fix', cansFooter: 'Finished mixes are saved here, so you don’t re-enter the recipe when fixing.', canNo: '#{n}',
  pickRecipe: 'Choose a recipe', noRecipes: 'No saved recipes', newRecipe: 'New recipe',
  mixStep1: 'Step 1 · Weigh the {base}', mixStep2: 'Step 2 · Add in this order', ofN: '{n} of {m}',
  pctOfBase: '{p}% of {base}', pctOfMix: '{p}% of {base}+{thinner}', ratioOf: '{base} 1 : {r}',
  totalInCan: 'Total in can', mixHint: 'Tap each row after you pour it. Amounts update if you change the weight.', finishMix: 'Finish & save can', left: '{n} left', enterWeight: 'Enter the weight',
  pickCan: 'Can to fix', noRecord: 'Can without a record', noRecordSub: 'Pick a recipe and enter the current ratio yourself',
  weigh: 'Weigh can', weighStep1: 'Step 1 · Put the can on the scale', scale: 'Scale reading', tare: 'Empty can', tareHint: 'The empty can weight is remembered for next time.', remain: 'Paint left',
  weighStep2: 'Step 2 · What’s in the can now', fromMix: 'From mix at {time}', manualState: 'Entered by hand', stateHint: 'Taken from when it was mixed. Edit only if you added something else.',
  calcAdd: 'Calculate what to add', addTitle: 'Add to can', addTotal: 'Total to add', order: 'Add in this order', keep: 'Don’t add',
  stuckNote: 'Can’t be taken out: {names}. The rest is increased to match the target.', finishFix: 'Finish & save', nothing: 'Already matches the target.', targetIs: 'Target: {name}',
  currentState: 'In the can now',
  recipes: 'Recipes', recipeName: 'Name', recipeNamePh: 'e.g. Gray topcoat', color: 'Color', baseType: 'Base material', materials: 'Materials to add', addMaterial: 'Add material',
  materialLabel: 'Label (optional)', materialLabelPh: 'e.g. Yellow', basis: 'Pigment % based on', basisBase: '{base} only', basisMix: '{base}+{thinner}',
  outerHint: '% is relative to the {base} weight.', thinnerHint: '{thinner} is entered as {base} 1 : x.',
  ratioMode: 'Enter as ratio', totalPct: 'Total content', parts: 'Parts', apply: 'Apply', deleteRecipe: 'Delete recipe', confirmDeleteRecipe: 'Delete this recipe?', confirmDeleteCan: 'Delete this can record?',
  untitled: 'Untitled recipe', exportAll: 'Export recipes', importAll: 'Import recipes', importDone: 'Imported {n} recipes.', importFail: 'Couldn’t read the file.',
  shareHint: 'Import the exported file on another phone to use the same recipes. Data is stored only on this device.',
  defectRate: 'Defect rate', ofTotal: '{m} of {n}', totalQty: 'Total quantity', itemPh: 'Item', count: 'Count', addItem: 'Add item',
  overWarn: 'Defects add up to more than the total.', defectHint: 'Bars show each item’s share of defects; numbers are % of the total quantity.', reset: 'Reset',
}

const vi = {
  tabWork: 'Công việc', tabRecipes: 'Công thức', tabDefects: 'Tỷ lệ lỗi',
  back: 'Quay lại', close: 'Đóng', cancel: 'Hủy', done: 'Xong', save: 'Lưu', delete: 'Xóa', edit: 'Sửa', language: 'Ngôn ngữ',
  today: 'Hôm nay', pcs: '{n} cái',
  'type.base': 'Sơn gốc', 'type.gloss': 'Bóng', 'type.matte': 'Mờ', 'type.thinner': 'Dung môi', 'type.pigment': 'Chất màu', 'type.additive': 'Phụ gia', 'type.other': 'Khác',
  ask: 'Bạn đang làm gì?', newMix: 'Pha mới', newMixSub: 'Pha từ thùng rỗng', fix: 'Chỉnh thùng đã pha', fixSub: 'Chỉnh lại tỷ lệ của thùng đã pha',
  cans: 'Thùng đã pha', fixBtn: 'Chỉnh', cansFooter: 'Thùng pha xong được lưu ở đây, khi chỉnh không cần nhập lại công thức.', canNo: '#{n}',
  pickRecipe: 'Chọn công thức', noRecipes: 'Chưa có công thức', newRecipe: 'Công thức mới',
  mixStep1: 'Bước 1 · Cân {base}', mixStep2: 'Bước 2 · Thêm theo thứ tự', ofN: '{n} / {m}',
  pctOfBase: '{p}% so với {base}', pctOfMix: '{p}% so với {base}+{thinner}', ratioOf: '{base} 1 : {r}',
  totalInCan: 'Tổng trong thùng', mixHint: 'Chạm vào từng dòng sau khi đổ. Lượng sẽ tính lại khi đổi trọng lượng.', finishMix: 'Xong và lưu thùng', left: 'Còn {n}', enterWeight: 'Nhập trọng lượng',
  pickCan: 'Thùng cần chỉnh', noRecord: 'Thùng không có ghi chép', noRecordSub: 'Chọn công thức và tự nhập tỷ lệ hiện tại',
  weigh: 'Cân thùng', weighStep1: 'Bước 1 · Đặt thùng lên cân', scale: 'Số trên cân', tare: 'Thùng rỗng', tareHint: 'Trọng lượng thùng rỗng được ghi nhớ cho lần sau.', remain: 'Sơn còn lại',
  weighStep2: 'Bước 2 · Thành phần hiện tại', fromMix: 'Theo lần pha {time}', manualState: 'Nhập tay', stateHint: 'Lấy tự động từ lúc pha. Chỉ sửa nếu đã thêm gì khác.',
  calcAdd: 'Tính lượng cần thêm', addTitle: 'Cần thêm', addTotal: 'Tổng cần thêm', order: 'Thêm theo thứ tự', keep: 'Không thêm',
  stuckNote: 'Không thể bớt: {names}. Tăng các thành phần còn lại để đạt mục tiêu.', finishFix: 'Xong và lưu', nothing: 'Đã đúng công thức mục tiêu.', targetIs: 'Mục tiêu: {name}',
  currentState: 'Trong thùng hiện tại',
  recipes: 'Công thức', recipeName: 'Tên', recipeNamePh: 'VD: Sơn phủ xám', color: 'Màu', baseType: 'Vật liệu gốc', materials: 'Vật liệu thêm vào', addMaterial: 'Thêm vật liệu',
  materialLabel: 'Tên (tùy chọn)', materialLabelPh: 'VD: Vàng', basis: '% chất màu tính theo', basisBase: 'Chỉ {base}', basisMix: '{base}+{thinner}',
  outerHint: '% tính theo trọng lượng {base}.', thinnerHint: '{thinner} nhập theo tỷ lệ {base} 1 : x.',
  ratioMode: 'Nhập theo tỷ lệ', totalPct: 'Tổng hàm lượng', parts: 'Tỷ lệ', apply: 'Áp dụng', deleteRecipe: 'Xóa công thức', confirmDeleteRecipe: 'Xóa công thức này?', confirmDeleteCan: 'Xóa ghi chép thùng này?',
  untitled: 'Công thức chưa đặt tên', exportAll: 'Xuất công thức', importAll: 'Nhập công thức', importDone: 'Đã nhập {n} công thức.', importFail: 'Không đọc được tệp.',
  shareHint: 'Nhập tệp đã xuất trên điện thoại khác để dùng cùng công thức. Dữ liệu chỉ lưu trên máy này.',
  defectRate: 'Tỷ lệ lỗi', ofTotal: '{m} trên {n}', totalQty: 'Tổng số lượng', itemPh: 'Hạng mục', count: 'Số lượng', addItem: 'Thêm hạng mục',
  overWarn: 'Tổng lỗi lớn hơn tổng số lượng.', defectHint: 'Thanh là phần trong tổng lỗi; số bên phải là % so với tổng số lượng.', reset: 'Đặt lại',
}

const zh = {
  tabWork: '工作', tabRecipes: '配方', tabDefects: '不良率',
  back: '返回', close: '关闭', cancel: '取消', done: '完成', save: '保存', delete: '删除', edit: '编辑', language: '语言',
  today: '今天', pcs: '{n} 个',
  'type.base': '主剂', 'type.gloss': '亮光', 'type.matte': '哑光', 'type.thinner': '稀释剂', 'type.pigment': '色浆', 'type.additive': '添加剂', 'type.other': '其他',
  ask: '您要做什么？', newMix: '新调配', newMixSub: '从空桶开始调配', fix: '修正已调好的桶', fixSub: '调整已调好桶的比例',
  cans: '已调好的桶', fixBtn: '修正', cansFooter: '调配完成的桶会保存在这里，修正时无需重新输入配方。', canNo: '#{n}',
  pickRecipe: '选择配方', noRecipes: '没有已保存的配方', newRecipe: '新配方',
  mixStep1: '第 1 步 · 称量{base}', mixStep2: '第 2 步 · 按顺序添加', ofN: '{n} / {m}',
  pctOfBase: '{base}的 {p}%', pctOfMix: '{base}+{thinner}的 {p}%', ratioOf: '{base} 1 : {r}',
  totalInCan: '桶内总量', mixHint: '倒入后点一下该行。改变重量时用量会重新计算。', finishMix: '完成并保存', left: '还剩 {n} 项', enterWeight: '请输入重量',
  pickCan: '要修正的桶', noRecord: '没有记录的桶', noRecordSub: '选择配方并手动输入当前比例',
  weigh: '称桶', weighStep1: '第 1 步 · 把桶放到秤上', scale: '秤上读数', tare: '空桶重量', tareHint: '空桶重量会记住，下次自动使用。', remain: '剩余涂料',
  weighStep2: '第 2 步 · 桶内当前成分', fromMix: '{time} 调配记录', manualState: '手动输入', stateHint: '取自调配时的记录。只有加过其他东西时才需要修改。',
  calcAdd: '计算需要添加的量', addTitle: '需要添加', addTotal: '共需添加', order: '按顺序添加', keep: '不加',
  stuckNote: '无法减少：{names}。增加其他成分以达到目标。', finishFix: '完成并保存', nothing: '已经符合目标配方。', targetIs: '目标：{name}',
  currentState: '桶内当前',
  recipes: '配方', recipeName: '名称', recipeNamePh: '例：灰色面漆', color: '颜色', baseType: '基准材料', materials: '添加材料', addMaterial: '添加材料',
  materialLabel: '名称（可选）', materialLabelPh: '例：黄色', basis: '色浆 % 基准', basisBase: '仅{base}', basisMix: '{base}+{thinner}',
  outerHint: '% 以{base}重量为基准。', thinnerHint: '{thinner}按 {base} 1 : x 输入。',
  ratioMode: '按比例输入', totalPct: '总含量', parts: '比例', apply: '应用', deleteRecipe: '删除配方', confirmDeleteRecipe: '删除此配方？', confirmDeleteCan: '删除此桶记录？',
  untitled: '未命名配方', exportAll: '导出配方', importAll: '导入配方', importDone: '已导入 {n} 个配方。', importFail: '无法读取文件。',
  shareHint: '在另一部手机导入导出的文件即可使用相同配方。数据只保存在本机。',
  defectRate: '不良率', ofTotal: '{n} 个中 {m} 个', totalQty: '总数量', itemPh: '项目', count: '数量', addItem: '添加项目',
  overWarn: '不良合计超过总数量。', defectHint: '横条表示在不良中的占比，右侧数字为占总数量的比例。', reset: '重置',
}

const ru = {
  tabWork: 'Работа', tabRecipes: 'Рецепты', tabDefects: 'Брак',
  back: 'Назад', close: 'Закрыть', cancel: 'Отмена', done: 'Готово', save: 'Сохранить', delete: 'Удалить', edit: 'Изменить', language: 'Язык',
  today: 'Сегодня', pcs: '{n} шт.',
  'type.base': 'Основа', 'type.gloss': 'Глянец', 'type.matte': 'Мат', 'type.thinner': 'Растворитель', 'type.pigment': 'Пигмент', 'type.additive': 'Добавка', 'type.other': 'Другое',
  ask: 'Что вы делаете?', newMix: 'Новая смесь', newMixSub: 'С пустой банки', fix: 'Исправить смесь', fixSub: 'Подогнать пропорции готовой смеси',
  cans: 'Готовые смеси', fixBtn: 'Исправить', cansFooter: 'Готовые смеси сохраняются здесь — при исправлении рецепт не нужно вводить заново.', canNo: '№{n}',
  pickRecipe: 'Выберите рецепт', noRecipes: 'Нет сохранённых рецептов', newRecipe: 'Новый рецепт',
  mixStep1: 'Шаг 1 · Взвесьте: {base}', mixStep2: 'Шаг 2 · Добавляйте по порядку', ofN: '{n} из {m}',
  pctOfBase: '{p}% от: {base}', pctOfMix: '{p}% от: {base}+{thinner}', ratioOf: '{base} 1 : {r}',
  totalInCan: 'Всего в банке', mixHint: 'Нажмите на строку после того, как вылили. При изменении веса количества пересчитываются.', finishMix: 'Готово, сохранить', left: 'Осталось: {n}', enterWeight: 'Введите вес',
  pickCan: 'Какую банку исправить', noRecord: 'Банка без записи', noRecordSub: 'Выберите рецепт и введите текущие пропорции вручную',
  weigh: 'Взвесить банку', weighStep1: 'Шаг 1 · Поставьте банку на весы', scale: 'Показания весов', tare: 'Пустая банка', tareHint: 'Вес пустой банки запоминается.', remain: 'Осталось краски',
  weighStep2: 'Шаг 2 · Что сейчас в банке', fromMix: 'По смеси в {time}', manualState: 'Введено вручную', stateHint: 'Взято из записи смешивания. Меняйте, только если добавляли что-то ещё.',
  calcAdd: 'Рассчитать добавку', addTitle: 'Добавить', addTotal: 'Всего добавить', order: 'Добавляйте по порядку', keep: 'Не добавлять',
  stuckNote: 'Нельзя убрать: {names}. Остальное увеличивается до цели.', finishFix: 'Готово, сохранить', nothing: 'Уже соответствует цели.', targetIs: 'Цель: {name}',
  currentState: 'Сейчас в банке',
  recipes: 'Рецепты', recipeName: 'Название', recipeNamePh: 'напр. Серый финиш', color: 'Цвет', baseType: 'Основной материал', materials: 'Что добавлять', addMaterial: 'Добавить материал',
  materialLabel: 'Название (необяз.)', materialLabelPh: 'напр. Жёлтый', basis: '% пигмента от', basisBase: 'только {base}', basisMix: '{base}+{thinner}',
  outerHint: '% считается от веса: {base}.', thinnerHint: '{thinner} вводится как {base} 1 : x.',
  ratioMode: 'Ввести пропорцией', totalPct: 'Общее содержание', parts: 'Части', apply: 'Применить', deleteRecipe: 'Удалить рецепт', confirmDeleteRecipe: 'Удалить этот рецепт?', confirmDeleteCan: 'Удалить запись банки?',
  untitled: 'Рецепт без названия', exportAll: 'Экспорт рецептов', importAll: 'Импорт рецептов', importDone: 'Импортировано рецептов: {n}.', importFail: 'Не удалось прочитать файл.',
  shareHint: 'Импортируйте файл на другом телефоне, чтобы пользоваться теми же рецептами. Данные хранятся только на этом устройстве.',
  defectRate: 'Доля брака', ofTotal: '{m} из {n}', totalQty: 'Всего изделий', itemPh: 'Пункт', count: 'Кол-во', addItem: 'Добавить пункт',
  overWarn: 'Брака больше, чем всего изделий.', defectHint: 'Полоса — доля в общем браке, число справа — % от всего количества.', reset: 'Сбросить',
}

const uk = {
  tabWork: 'Робота', tabRecipes: 'Рецепти', tabDefects: 'Брак',
  back: 'Назад', close: 'Закрити', cancel: 'Скасувати', done: 'Готово', save: 'Зберегти', delete: 'Видалити', edit: 'Змінити', language: 'Мова',
  today: 'Сьогодні', pcs: '{n} шт.',
  'type.base': 'Основа', 'type.gloss': 'Глянець', 'type.matte': 'Мат', 'type.thinner': 'Розчинник', 'type.pigment': 'Пігмент', 'type.additive': 'Добавка', 'type.other': 'Інше',
  ask: 'Що ви робите?', newMix: 'Нова суміш', newMixSub: 'З порожньої банки', fix: 'Виправити суміш', fixSub: 'Підігнати пропорції готової суміші',
  cans: 'Готові суміші', fixBtn: 'Виправити', cansFooter: 'Готові суміші зберігаються тут — при виправленні рецепт не потрібно вводити знову.', canNo: '№{n}',
  pickRecipe: 'Оберіть рецепт', noRecipes: 'Немає збережених рецептів', newRecipe: 'Новий рецепт',
  mixStep1: 'Крок 1 · Зважте: {base}', mixStep2: 'Крок 2 · Додавайте по черзі', ofN: '{n} з {m}',
  pctOfBase: '{p}% від: {base}', pctOfMix: '{p}% від: {base}+{thinner}', ratioOf: '{base} 1 : {r}',
  totalInCan: 'Усього в банці', mixHint: 'Натисніть рядок після того, як вилили. Кількості перераховуються при зміні ваги.', finishMix: 'Готово, зберегти', left: 'Залишилось: {n}', enterWeight: 'Введіть вагу',
  pickCan: 'Яку банку виправити', noRecord: 'Банка без запису', noRecordSub: 'Оберіть рецепт і введіть поточні пропорції вручну',
  weigh: 'Зважити банку', weighStep1: 'Крок 1 · Поставте банку на ваги', scale: 'Показ ваг', tare: 'Порожня банка', tareHint: 'Вага порожньої банки запам’ятовується.', remain: 'Залишок фарби',
  weighStep2: 'Крок 2 · Що зараз у банці', fromMix: 'За сумішшю о {time}', manualState: 'Введено вручну', stateHint: 'Взято із запису змішування. Змінюйте, лише якщо додавали щось інше.',
  calcAdd: 'Розрахувати додавання', addTitle: 'Додати', addTotal: 'Усього додати', order: 'Додавайте по черзі', keep: 'Не додавати',
  stuckNote: 'Не можна прибрати: {names}. Решту збільшено до цілі.', finishFix: 'Готово, зберегти', nothing: 'Уже відповідає цілі.', targetIs: 'Ціль: {name}',
  currentState: 'Зараз у банці',
  recipes: 'Рецепти', recipeName: 'Назва', recipeNamePh: 'напр. Сірий фініш', color: 'Колір', baseType: 'Основний матеріал', materials: 'Що додавати', addMaterial: 'Додати матеріал',
  materialLabel: 'Назва (необов.)', materialLabelPh: 'напр. Жовтий', basis: '% пігменту від', basisBase: 'лише {base}', basisMix: '{base}+{thinner}',
  outerHint: '% рахується від ваги: {base}.', thinnerHint: '{thinner} вводиться як {base} 1 : x.',
  ratioMode: 'Ввести пропорцією', totalPct: 'Загальний вміст', parts: 'Частини', apply: 'Застосувати', deleteRecipe: 'Видалити рецепт', confirmDeleteRecipe: 'Видалити цей рецепт?', confirmDeleteCan: 'Видалити запис банки?',
  untitled: 'Рецепт без назви', exportAll: 'Експорт рецептів', importAll: 'Імпорт рецептів', importDone: 'Імпортовано рецептів: {n}.', importFail: 'Не вдалося прочитати файл.',
  shareHint: 'Імпортуйте файл на іншому телефоні, щоб користуватися тими самими рецептами. Дані зберігаються лише на цьому пристрої.',
  defectRate: 'Частка браку', ofTotal: '{m} з {n}', totalQty: 'Усього виробів', itemPh: 'Пункт', count: 'К-сть', addItem: 'Додати пункт',
  overWarn: 'Браку більше, ніж усього виробів.', defectHint: 'Смуга — частка в загальному браку, число праворуч — % від усієї кількості.', reset: 'Скинути',
}

export const DICT = { ko, en, vi, zh, ru, uk }

export function detectLang() {
  const prefs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || []
  for (const p of prefs) {
    const c = String(p).toLowerCase().slice(0, 2)
    if (DICT[c]) return c
  }
  return 'ko'
}

export function makeT(lang) {
  const d = DICT[lang] || ko
  return (key, vars) => {
    let s = d[key] ?? ko[key] ?? key
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k])
    return s
  }
}

export function makeFmt(lang) {
  const loc = { ko: 'ko-KR', en: 'en-US', vi: 'vi-VN', zh: 'zh-CN', ru: 'ru-RU', uk: 'uk-UA' }[lang] || 'ko-KR'
  const cache = {}
  const num = (n, d = 1) => {
    if (!Number.isFinite(n)) return '–'
    const f = (cache[d] ||= new Intl.NumberFormat(loc, { maximumFractionDigits: d }))
    return f.format(Math.abs(n) < 1e-9 ? 0 : n)
  }
  const time = (ts) => new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
  const date = (ts) => new Intl.DateTimeFormat(loc, { month: 'short', day: 'numeric' }).format(new Date(ts))
  return { num, time, date, locale: loc }
}
