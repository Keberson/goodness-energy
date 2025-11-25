-- SQL скрипт для автоматической инициализации базы данных
-- Выполняется автоматически после создания таблиц через SQLAlchemy
-- Этот скрипт содержит только INSERT команды (без DELETE)

BEGIN;

-- Администратор
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) 
VALUES ('admin', '$2b$12$TkAtBetIeANABsoQ8d.R7.AVHURJPVSShdYdJGk9YXcdQzzV0mJUC', 'ADMIN', false, false, false, NOW())
ON CONFLICT (login) DO NOTHING;

-- НКО #1: ОО ТОС АГО "12а микрорайон"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) 
VALUES ('npo1', '$2b$12$zCHnZ4WqVz9DtvXII/3VYOKmvTsntAb6ycB1Sod56VeSZzhqmIDVK', 'NPO', false, false, false, NOW())
ON CONFLICT (login) DO NOTHING;

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo1'),
  'ОО ТОС АГО "12а микрорайон"',
  'Основная деятельность
Повышение качества жизни жителей 12а микрорайона г.Ангарска Иркутской области ( Благоустройство и содержании территории, организация культурных, спортивных и социально значимых мероприятий, взаимодействие с органами власти для учёта мнения жителей, , экологии и социальной помощи.

ЦА
Жители микрорайона 12А (социально незащищенные группы: пенсионеры, инвалиды, многодетные семьи, малоимущие и д.р. дети и молодежь, собственники жилья.)

План мероприятий на год
1) Физическая зарядка для пенсионеров каждый четверг
2) Каждую пятницу тренировки по скандинавской ходьбе для всех возрастов. 
3) До 30.10.2025 установка детской эко-площадки и открытие площадки.
4) Раз в месяц встречи с жителями по обсуждению проблем на территории и пути решения.',
  52.512272,
  103.861361,
  NULL,
  'Ангарск',
  NULL,
  '{"vk": "https://vk.com/id746471055"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Местное сообщество и развитие территорий'
);

-- НКО #2: Благотворительный общественно полезный фонд помощи социально незащищенным слоям населения "Платформа добрых дел"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo2', '$2b$12$BKXx9fTuiGNSeucFKJKy8.yvpavqKSdEBjwgfHvUIZYORTjcMCY46', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo2'),
  'Благотворительный общественно полезный фонд помощи социально незащищенным слоям населения "Платформа добрых дел"',
  'Основная деятельность
Благотворительный общественно полезный фонд помощи социально незащищенным слоям населения «Платформа добрых дел»
Основной вид деятельности (ОКВЭД) 64.99 

ЦА
молодые люди с инвалидностью старше 18 лет, граждане старшего возраста (пенсионного)

План мероприятий на год
Плана мероприятий пока нет, так как такового обозначенного плана нашим фондом не имеется.',
  47.5136,
  42.1514,
  NULL,
  'Волгодонск',
  NULL,
  '{"website": "-"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  'Социальная защита (помощь людям в трудной ситуации)'
);

-- НКО #3: МБУ "Молодежный центр"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo3', '$2b$12$0lvHLtufLc.54jOfCSqe4eT/3viOW7S23sy1SjVM6TRClaYCmvdjG', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo3'),
  'МБУ "Молодежный центр"',
  'Основные деятельность:
-Консультирование и регистрация на площадке «Добро.РФ»
-Проведение "Школы волонтеров" 
-Формирование и сопровождение волонтерских корпусов (например, на общегородских мероприятиях, федеральных проектах (Формирование комфортной городской среды)
-Информирование граждан и организаторов о развитии добровольчества, благотворительности и гражданских инициатив (индивидуально)

ЦА:
Молодежь в возрасте от 14 до 35 лет

План мероприятий:
файл',
  58.137855,
  52.647851,
  NULL,
  'Глазов',
  NULL,
  '{"vk": "https://vk.com/mcglazov"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')),
  'Местное сообщество и развитие территорий'
);

-- НКО #4: Культурная база "Короленко 8" (МБУ "ЦМиТО УКСиМП"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo4', '$2b$12$ZlHp5zqOkgURIeAdHiy9pOeX3xj3YsGw3yHrPyLqFcoFxQJ/j3yg6', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo4'),
  'Культурная база "Короленко 8" (МБУ "ЦМиТО УКСиМП"',
  'Основная деятельность:  
Ресурсный центр помощи НКО и сообществам, учреждениям культуры, образования

ЦА: 
Инициативные жители, сообщества, НКО, учреждения города',
  58.138558,
  52.666123,
  NULL,
  'Глазов',
  NULL,
  '{"vk": "https://m.vk.com/korolenko8?from=groups"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo4')),
  'Другое'
);

-- НКО #5: КРОМО "Экологический союз"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo5', '$2b$12$CbKnHlDXJXnJNOT54Ce/OuGB88fZlF8.L/mTzqiwgs7z6cmFDEHrK', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo5'),
  'КРОМО "Экологический союз"',
  'Основная деятельность: 
Организация и проведение различных экскурсий, конкурсов, выставок, акций, конференций, фестивалей, семинаров, олимпиад, походов, круглых столов, курсов, связанных с миром природы. Разработка и реализация просветительных программ эколого -биологической, естественно-научной, природоохранной, туристско - краеведческой направленности для детей и взрослых вместе с детьми. Оказание практической помощи другим организациям и привлечение молодежи к участию в экологической работе на территории ЗАТО Железногорск. 

ЦА: 
Активная молодежь, заинтересовнная в решении экологических проблем и природоохранной деятельности, экоактивисты.

План мероприятий на год:
1) «Нескучная инженерия» при поддержке АНО «Энергия развития» ГК Росатом.
2) «Ни грамма скуки» - при поддержке фонда президентских грантов.
3) «Меняй себя, а не климат» поддержанный фондом «Соработничество» (с 1 августа).
4) Проект «Система ЗАТО Железногорск» (с 1 декабря).',
  56.243963,
  93.542269,
  NULL,
  'Железногорск',
  NULL,
  '{"vk": "Vk.com/ecosoyuz24"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo5')),
  'Экология и устойчивое развитие'
);

-- НКО #6: Федерация картинга
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo6', '$2b$12$.we.vPAXtqlQA3NcZrSIS.NLka1W83ExUnL5dG6hXI5YMocbm2hw2', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo6'),
  'Федерация картинга',
  NULL,
  56.102057,
  94.604122,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "Vk.com/publik177651782"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo6')),
  'Здоровье и спорт'
);

-- НКО #7: НКО "Резервный фонд поддержки гражданских инициатив города Зеленогорска"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo7', '$2b$12$XBqEqK.QN/tvg1D.R48dmuMY7rG7Rx5UoXmni8NVjut.KUezQApyS', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo7'),
  'НКО "Резервный фонд поддержки гражданских инициатив города Зеленогорска"',
  'Три года назад Фонд планировали закрывать. Потом он стал площадкой по сбору средст в поддержку волонтеров СВО, т.к. других фондов в городе нет. 

Основаная детельность:
На сегодня принято решение оставить Фонд после окончания СВО. Он будет заниматься сбором пожертвований и помощью людям в тяжелых ситуациях (пожары, болезни и т.п.). 

ЦА:  
люди в сложной жизненой ситуации',
  56.1128,
  94.5981,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "https://vk.com/club206489451?from=groups"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo7')),
  'Местное сообщество и развитие территорий'
);

-- НКО #8: АНО "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo8', '$2b$12$AH1xGcf2jVtXg1wLg6LJzOJg4K/F3wzfhfFBWIsRpRTo8ZdP8aK52', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo8'),
  'АНО "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"',
  NULL,
  56.1128,
  94.5981,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "https://vk.com/cyberatom_zlk24"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo8')),
  'Здоровье и спорт'
);

-- НКО #9: АНО РАЗВИВАЮЩИЙ ЦЕНТР "СОЛНЕЧНЫЙ ГОРОД" "
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo9', '$2b$12$2jMgVmX.YXU6/IeGzeX6lOIFY67g5DybUJFat1YSQSebSPlSD6Afm', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo9'),
  'АНО РАЗВИВАЮЩИЙ ЦЕНТР "СОЛНЕЧНЫЙ ГОРОД" "',
  'Основаная детельность:
Оказание психолого-педагогической помощи семьям с детьми,  в том числе с инвалидностью и ОВЗ

ЦА: 
Семьи с детьми от рождения до 18 лет

План мероприятий на год: 
Проект "Передышка" (поддержан КЦПРОИ)',
  56.111057,
  94.591656,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "https://vk.com/sunny_gorod"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo9')),
  'Социальная защита (помощь людям в трудной ситуации)'
);

-- НКО #10: АНО КРЦРМСИГ ЕЛЕНЫ ЖИВАЕВОЙ
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo10', '$2b$12$hkwfBP2.gUDvAGRTQKem8eBKJvcdXCqggGmQr9J1AyhnuwHUyVbRy', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo10'),
  'АНО КРЦРМСИГ ЕЛЕНЫ ЖИВАЕВОЙ',
  'Информация об организации АНО КРЦРМСИГ Елены Живаевой',
  56.1128,
  94.5981,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "https://vk.com/elenazivaeva"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo10')),
  'Местное сообщество и развитие территорий'
);

-- НКО #11: АНО Ресурсный центр
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo11', '$2b$12$XNelCEZuAy7.AryY0rLMnO/yliOsG/nnh.xabGd5KRprooYyl/Eze', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo11'),
  'АНО Ресурсный центр',
  NULL,
  56.1128,
  94.5981,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "https://m.vk.com/resyrs.center?from=groups"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo11')),
  'Местное сообщество и развитие территорий'
);

-- НКО #12: АНО СС "Линия жизни"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo12', '$2b$12$4UYtsWlPsa91be0WH7svpOo/d2YC4PC.SH9TDcPOoc6TX0bK9LfoS', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo12'),
  'АНО СС "Линия жизни"',
  'Основная деятельность: 
Предоставление социальных услуг на дому

ЦА:
Пенсионеры, инвалиды, семьи с детьми инвалидами, люди оказавшись в трудной жизненной ситуации

План мероприятий на год:
1) Ежемесячно поздравление юбиляров на дому
2) Август - Сентябрь (Акция корзина добра сбор продуктов питания для малообеспечненых?)
3) Октябрь-День пожилого человека (поздравление презентами пожилых людей на дому)
4) Ноябрь - Международный день инвалида (посещение на дому молодых инвалидов с презентами)
5) День матери - поздравление многодетных матерей 
6) Декабрь - Новогодний экспресс (поздравление получателей социальных услуг)
Во всех мероприятиях нам помогают партнёры, садики, школы и техникум.',
  56.1128,
  94.5981,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "https://m.vk.com/liniya_zhizni_zel http://liniyazhiznizel.ru https://ok.ru/group/61396158775366"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo12')),
  'Социальная защита (помощь людям в трудной ситуации)'
);

-- НКО #13: АНО Центр досуга и развития детей
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo13', '$2b$12$9CsXDUKa9lzB2fbMeQ1pZ.A3yHaKYClyrCTlf4GuISicy/O7G7r6O', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo13'),
  'АНО Центр досуга и развития детей',
  NULL,
  60.199473,
  29.706081,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "https://vk.com/anocdrdzelenogorsk?from=groups"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo13')),
  'Культура и образование'
);

-- НКО #14: Автономная некоммерческая организация "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo14', '$2b$12$nwrUXC5LxtqGV8WRxzdwvudhwP5a27hmcy/G4CyM8gIKyVKGd.9Oq', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo14'),
  'Автономная некоммерческая организация "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"',
  'Основная деятельность: 
ОКВЭД 93.12 - Деятельность спортивных клубов. А если по факту, то занимаюсь развитием компьютерного спорта и фиджитал-спорта в нашем городе, проведением мероприятий, турниров и просветительской работой в этой области

Ца: подростки 12-17 лет, а также их родители. С первыми ведем непосредственную работу по развитию их навыков в киберспорте и фиджитале, а со вторыми веду просветительскую работу и просто рассказываю, что киберспорт это не бесконтрольный гейминг и не игромания, а такое же спортивное направление, как футбол, шахматы и так далее, он также развивает определенные навыки, и дети там также получают определенные знания и необходимую для них в наше время социализацию.

План мероприятий до конца года 
В планах до конца года открыть детский клуб, уже подготовительные работы ведутся, смета на оборудование подготовлена, но основная проблема в его дороговизне. Открыть клуб на 10 компьютеров, две приставки и 1 VR-шлем даже не на топовом оборудовании, но на более-менее актуальном, стоит по моим подсчетам порядка полутора миллионов. Это без затрат на ремонт и остальные расходы',
  56.1128,
  94.5981,
  NULL,
  'Зеленогорск',
  NULL,
  '{"vk": "группа ВК: https://vk.com/cyberatom_zlk24\nканал Телеграм: https://t.me/cyberatom_zlk24"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo14')),
  'Здоровье и спорт'
);

-- НКО #15: БФ «Планета кошек»
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo15', '$2b$12$niO.0W3ovQATJ3dtboupneaFB6IrSAbIgtmVxG3l.w/MJKKC9wNUW', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo15'),
  'БФ «Планета кошек»',
  'Благотворительный Фонд "Планета Кошек" — это проект помощи бездомным животным в Нижнем Новгороде!

Благотворительный Фонд "Планета Кошек" входит в состав многофункционального Центра помощи и реабилитации животных. Деятельность Фонда направлена на спасение животных, оказавшихся в сложных жизненных ситуация, брошенных на улице, нуждающихся в ветеринарной помощи!',
  56.313605,
  43.975423,
  NULL,
  'Нижний Новгород',
  NULL,
  '{"vk": "https://vk.com/planetakosheknn"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo15')),
  'Защита животных'
);

-- НКО #16: АНО ДПО "Техническая академия Росатома"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo16', '$2b$12$drx92/CC.9V8pppYM13HQ.ng1c.SXVdu.NkI1boWLD3TKBsWjLfNS', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo16'),
  'АНО ДПО "Техническая академия Росатома"',
  'На данный момент НКО нет. Находится на стадии формирования концепции и формализации идеи.',
  55.0969,
  36.6103,
  NULL,
  'Обнинск',
  NULL,
  '{"vk": "https://vk.com/rosatomtech"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo16')),
  'Другое'
);

-- НКО #17: АНО СЦСА НАШИ ДЕТИ
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo17', '$2b$12$v6itO4m42BtiKzl0p12UyO2v.znnDLTDE8XwSXKzUol/pMlhLb7Km', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo17'),
  'АНО СЦСА НАШИ ДЕТИ',
  'Основная деятельность: 
Помощь семьям воспитывающих детей с инвалидностью. Обучение неговорящих детей общаться при помощи альтернативной коммуникации. Открываем новое направление ранняя помощь детям до 3х  лет, имеющим трудности в развитии. 

ЦА: 
Семьи воспитывающие детей до 3х лет, имеющие трудности в развитии, проживающие в Омском регионе.
Семьи воспитывающие неговорящих детей, нуждающихся в альтернативных способах общения, проживающие в городе Омске. 

План мероприятий до конца года: 
1) 31.07.25 Встреча с зам министра образования Груздевой - обсуждение дорожной карты развития альтернативной коммуникации в адаптивных школах Омской области. Мероприятия появятся после обсуждения дорожной карты.
2) 31.08.25 Завершение мероприятий проекта - встреч детей с инвалидностью по проекту "Вокруг света" поддержанного Министерством труда и социального развития Омской области.
3) 1.08.2025 Старт волонтерского проекта совместно с Омским филиалом ПАО "Ростелеком" «Чтение без границ».
4) 19.12.2025 Проведение двух новогодних мероприятий для детей с инвалидностью, поддержка Администрации города Омска.
5) Ждем результаты гранта Министерства внутренней политики Омской области. Проект "Музыка для всех", в рамках которого заложено сотрудничество с музыкальными школами региона для расширения компетенций педагогов в работе с особенными детьми.
5) В рамках субсидии Министерства труда и социального развития проводим занятия на безвозмездной основе для 30 ребят, учим общаться при помощи альтернативной коммуникации. (индивидуальные и групповые занятия".
Занятия проводятся регулярно и постоянно.
6) С 15 сентября стартуют занятия в рамках ранней помощи для детей с трудностями в развитии до 3х лет. Ведем набор детей.',
  55.030959,
  73.299893,
  NULL,
  'Омск',
  NULL,
  '{"vk": "https://vk.com/ndetiomsk"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo17')),
  'Социальная защита (помощь людям в трудной ситуации)'
);

-- НКО #18: ТРОО "ВПЦ" МИРНЫЙ ВОИН"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo18', '$2b$12$L4hL/1Rkp2sFPU7JTUZdWeO/Hlwng9AEhuEg9zrsSzl1aD6YoP6Sq', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo18'),
  'ТРОО "ВПЦ" МИРНЫЙ ВОИН"',
  NULL,
  56.6006,
  84.8864,
  NULL,
  'Северск',
  NULL,
  '{"website": "https://ok.ru/profile/566417452251/statuses/156787104735451"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo18')),
  'Социальная защита (помощь людям в трудной ситуации)'
);

-- НКО #19: СГОО БУМЕРАНГ ДОБРА
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo19', '$2b$12$IkMIh0vL8ol9LTq4PqpK6uvJmfyaZUwBCAQOEnp7U.2GRFYBn5mBC', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo19'),
  'СГОО БУМЕРАНГ ДОБРА',
  NULL,
  56.080152,
  60.748289,
  NULL,
  'Снежинск',
  NULL,
  '{"vk": "https://vk.com/bdsnz"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo19')),
  'Социальная защита (помощь людям в трудной ситуации)'
);

-- НКО #20: ДоброЦентр при СО НКО Бумеранг добра
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo20', '$2b$12$LL1OpHMcDqSAmHa8edhPIO95A6.0ZiVyxeedz0FuvNgEDi3.LsNk.', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo20'),
  'ДоброЦентр при СО НКО Бумеранг добра',
  NULL,
  56.080152,
  60.748289,
  NULL,
  'Снежинск',
  NULL,
  '{"vk": "https://vk.com/snzzhensovet"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo20')),
  'Социальная защита (помощь людям в трудной ситуации)'
);

-- НКО #21: Снежинская городская общественная организация "Союз женщин Снежинска"
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo21', '$2b$12$XpxEdysg6aWITMBMZYPvI.MKm0oOJFMFgew22seAOJFlLVA7aIjZ2', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo21'),
  'Снежинская городская общественная организация "Союз женщин Снежинска"',
  'Основная деятельность:
Поддержка семей с детьми: многодетных, приемных семей, семей в городских общежитиях через Семейный клуб, развитие социального предпринимательства. Содействие повышению качества жизни старшего поколения через Клуб общения старшего поколения. 
Поддержка общественного движения по сохранению и  развитию национальных культур в Снежинске. 
Защита прав женщин.

ЦА:
Женщины, семьи с детьми, пенсионеры

План мероприятий на год: 
1) Открыть Семейный клуб и Центр долголетия',
  56.0850,
  60.7325,
  NULL,
  'Снежинск',
  NULL,
  '{"vk": "https://vk.com/sovetgensnz?from=groups"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo21')),
  'Местное сообщество и развитие территорий'
);

-- НКО #22: БФМС Новое Усолье
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo22', '$2b$12$tlyVc4AqOsOwjPityJ3HMOeUEjulEUN3gMpPO0hwr9lnur6iO37Xm', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo22'),
  'БФМС Новое Усолье',
  'Основная деятельность: 
Активизация/развитие местного сообщества для улучшения жизни в городе

ЦА:
Неравнодушные жители, женщины 40+, семьи с детьми',
  52.7506,
  103.6447,
  NULL,
  'Усолье-Сибирское',
  NULL,
  '{"vk": "https://vk.com/club166583301"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo22')),
  'Местное сообщество и развитие территорий'
);

-- НКО #23: УГМО ИОРОООО ВОИ
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo23', '$2b$12$d6QVsWrbyTGFD1J1GQxaieTLveplUdR.ZgZjP1aGJhcg/RRaMzIru', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo23'),
  'УГМО ИОРОООО ВОИ',
  'Основная деятельность:
Организация работает по поддержке людей с инвалидностью и развитию адаптивной физической культуры и спорта в городе. Группа изучает более 25 человек различных нозологических групп. 

ЦА: 
Люди с инвалидностью всех возрастов',
  52.7506,
  103.6447,
  NULL,
  'Усолье-Сибирское',
  NULL,
  '{"website": "-"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo23')),
  'Другое'
);

-- НКО #24: АНО «Твердыми шагами»
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) VALUES
  ('npo24', '$2b$12$6NdyhduZv3rl7zxiUgT/Ouuj5tDHiGJjO5IOdj/VAnbt0pgTGTyw6', 'NPO', false, false, false, NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo24'),
  'АНО «Твердыми шагами»',
  'Автономная некоммерческая организация помощи детям с ограниченными возможностями здоровья, инвалидностью и их семьям.',
  55.7556,
  60.7028,
  NULL,
  'Озёрск',
  NULL,
  '{"vk": "https://vk.com/club207076122"}',
  'CONFIRMED',
  NOW()
);

INSERT INTO npo_tags (npo_id, tag)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo24')),
  'Другое'
);

-- ============================================
-- Волонтёры
-- ============================================

-- Волонтёр 1: Андрей Миронов
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) 
VALUES ('vol1', '$2b$12$iX4s22IyK/8DXJzJgf/n7Og1MqSXU9Tu4e7K6m/TFCSrcVkkdJS3y', 'VOLUNTEER', false, false, false, NOW())
ON CONFLICT (login) DO NOTHING;

INSERT INTO volunteers (user_id, first_name, second_name, middle_name, about, birthday, city, sex, email, phone, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'vol1'),
  'Андрей',
  'Миронов',
  NULL,
  'Активный волонтёр с опытом работы в социальных проектах',
  '1995-05-15 00:00:00',
  'Глазов',
  'male',
  'andrey_mironov02@mail.ru',
  '+79991234567',
  NOW()
);

-- Волонтёр 2: Кузов Максим
INSERT INTO users (login, password_hash, role, notify_city_news, notify_registrations, notify_events, created_at) 
VALUES ('vol2', '$2b$12$iX4s22IyK/8DXJzJgf/n7Og1MqSXU9Tu4e7K6m/TFCSrcVkkdJS3y', 'VOLUNTEER', false, false, false, NOW())
ON CONFLICT (login) DO NOTHING;

INSERT INTO volunteers (user_id, first_name, second_name, middle_name, about, birthday, city, sex, email, phone, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'vol2'),
  'Максим',
  'Кузов',
  NULL,
  'Волонтёр, специализирующийся на экологических проектах',
  '1998-08-20 00:00:00',
  'Ангарск',
  'male',
  'k3berson@gmail.com',
  '+79991234568',
  NOW()
);

-- ============================================
-- События
-- ============================================

-- Событие 1: Экологическая акция (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Экологическая акция "Чистый город"',
  'Масштабная акция по уборке городских парков и скверов. Приглашаем всех желающих присоединиться к нам!',
  '2025-11-20 10:00:00',
  '2025-11-20 16:00:00',
  52.5444,
  103.8889,
  50,
  'Ангарск',
  'PUBLISHED',
  '2025-11-18 10:00:00'
);

-- Событие 2: Помощь пожилым людям (для НКО #2)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  'Волонтёрская помощь пожилым людям',
  'Регулярное мероприятие по оказанию помощи пожилым людям: покупка продуктов, помощь по дому, общение.',
  '2025-11-22 09:00:00',
  '2025-11-22 13:00:00',
  47.5136,
  42.1514,
  30,
  'Волгодонск',
  'PUBLISHED',
  '2025-11-19 14:00:00'
);

-- Событие 3: Школа волонтеров (для НКО #3)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')),
  'Школа волонтеров',
  'Обучающее мероприятие для новых волонтеров. Расскажем о принципах работы, правах и обязанностях.',
  '2025-11-23 11:00:00',
  '2025-11-23 15:00:00',
  58.1394,
  52.6583,
  25,
  'Глазов',
  'PUBLISHED',
  '2025-11-20 09:00:00'
);

-- Событие 4: Экологический поход (для НКО #5)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo5')),
  'Экологический поход "Меняй себя, а не климат"',
  'Познавательный поход с мастер-классами по экологичному образу жизни.',
  '2025-11-24 08:00:00',
  '2025-11-24 18:00:00',
  56.2511,
  93.5319,
  40,
  'Железногорск',
  'PUBLISHED',
  '2025-11-21 12:00:00'
);

-- Событие 5: Турнир по картингу (для НКО #6)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo6')),
  'Городской турнир по картингу',
  'Соревнования по картингу для детей и подростков. Регистрация обязательна.',
  '2025-11-22 14:00:00',
  '2025-11-22 18:00:00',
  56.1128,
  94.5981,
  20,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-19 16:00:00'
);

-- Событие 6: Физзарядка для пенсионеров (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Физическая зарядка для пенсионеров',
  'Еженедельная зарядка для людей старшего возраста. Проводится каждый четверг.',
  '2025-11-06 09:00:00',
  '2025-11-06 10:00:00',
  52.5444,
  103.8889,
  30,
  'Ангарск',
  'PUBLISHED',
  '2025-11-01 10:00:00'
);

-- Событие 7: Скандинавская ходьба (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Тренировка по скандинавской ходьбе',
  'Тренировки по скандинавской ходьбе для всех возрастов. Проводятся каждую пятницу.',
  '2025-11-07 10:00:00',
  '2025-11-07 11:30:00',
  52.5444,
  103.8889,
  25,
  'Ангарск',
  'PUBLISHED',
  '2025-11-02 09:00:00'
);

-- Событие 8: Встреча с жителями (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Встреча с жителями микрорайона',
  'Ежемесячная встреча для обсуждения проблем на территории и путей их решения.',
  '2025-11-15 18:00:00',
  '2025-11-15 20:00:00',
  52.5444,
  103.8889,
  50,
  'Ангарск',
  'PUBLISHED',
  '2025-11-10 12:00:00'
);

-- Событие 9: Экологический конкурс (для НКО #5)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo5')),
  'Экологический конкурс "Нескучная инженерия"',
  'Конкурс экологических проектов для молодежи. При поддержке АНО "Энергия развития" ГК Росатом.',
  '2025-11-10 12:00:00',
  '2025-11-10 17:00:00',
  56.2511,
  93.5319,
  40,
  'Железногорск',
  'PUBLISHED',
  '2025-11-05 14:00:00'
);

-- Событие 10: Проект "Ни грамма скуки" (для НКО #5)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo5')),
  'Проект "Ни грамма скуки"',
  'Интерактивные мероприятия для детей и подростков. При поддержке фонда президентских грантов.',
  '2025-11-14 14:00:00',
  '2025-11-14 18:00:00',
  56.2511,
  93.5319,
  35,
  'Железногорск',
  'PUBLISHED',
  '2025-11-08 10:00:00'
);

-- Событие 11: Помощь семьям (для НКО #2)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  'Помощь молодым людям с инвалидностью',
  'Волонтерская поддержка молодых людей с инвалидностью старше 18 лет.',
  '2025-11-12 10:00:00',
  '2025-11-12 14:00:00',
  47.5136,
  42.1514,
  20,
  'Волгодонск',
  'PUBLISHED',
  '2025-11-05 11:00:00'
);

-- Событие 12: Киберспортивный турнир (для НКО #8)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo8')),
  'Киберспортивный турнир для подростков',
  'Турнир по компьютерным играм для подростков 12-17 лет.',
  '2025-11-16 15:00:00',
  '2025-11-16 20:00:00',
  56.1128,
  94.5981,
  16,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-10 09:00:00'
);

-- Событие 13: Помощь семьям с детьми (для НКО #9)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo9')),
  'Проект "Передышка" для семей',
  'Психолого-педагогическая помощь семьям с детьми, в том числе с инвалидностью и ОВЗ.',
  '2025-11-18 11:00:00',
  '2025-11-18 15:00:00',
  56.1128,
  94.5981,
  15,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-12 10:00:00'
);

-- Событие 14: Помощь бездомным животным (для НКО #15)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo15')),
  'Акция помощи бездомным животным',
  'Сбор средств и корма для бездомных животных. Вакцинация и стерилизация.',
  '2025-11-25 10:00:00',
  '2025-11-25 16:00:00',
  56.3269,
  44.0075,
  30,
  'Нижний Новгород',
  'PUBLISHED',
  '2025-11-20 12:00:00'
);

-- Событие 15: Помощь детям с инвалидностью (для НКО #17)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo17')),
  'Занятия по альтернативной коммуникации',
  'Индивидуальные и групповые занятия для неговорящих детей.',
  '2025-11-28 10:00:00',
  '2025-11-28 13:00:00',
  54.9885,
  73.3242,
  20,
  'Омск',
  'PUBLISHED',
  '2025-11-22 09:00:00'
);

-- Событие 16: Новогоднее мероприятие (для НКО #17)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo17')),
  'Новогоднее мероприятие для детей с инвалидностью',
  'Праздничное мероприятие с подарками и развлечениями. Поддержка Администрации города Омска.',
  '2025-12-01 14:00:00',
  '2025-12-01 18:00:00',
  54.9885,
  73.3242,
  50,
  'Омск',
  'PUBLISHED',
  '2025-11-25 11:00:00'
);

-- ============================================
-- Теги событий
-- ============================================

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'),
  'Экология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Волонтёрская помощь пожилым людям'),
  'Пожилые люди'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Школа волонтеров'),
  'Обучение'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологический поход "Меняй себя, а не климат"'),
  'Экология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Городской турнир по картингу'),
  'Спорт'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Физическая зарядка для пенсионеров'),
  'Здоровье'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Тренировка по скандинавской ходьбе'),
  'Спорт'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Встреча с жителями микрорайона'),
  'Местное сообщество'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологический конкурс "Нескучная инженерия"'),
  'Экология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Проект "Ни грамма скуки"'),
  'Образование'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Помощь молодым людям с инвалидностью'),
  'Социальная помощь'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Киберспортивный турнир для подростков'),
  'Спорт'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Проект "Передышка" для семей'),
  'Социальная помощь'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция помощи бездомным животным'),
  'Защита животных'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Занятия по альтернативной коммуникации'),
  'Образование'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Новогоднее мероприятие для детей с инвалидностью'),
  'Социальная помощь'
);

-- ============================================
-- Отклики на события
-- ============================================

-- Отклики на событие 1 (Экологическая акция)
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-18 15:30:00'
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-19 10:20:00'
);

-- Отклик на событие 2 (Помощь пожилым)
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Волонтёрская помощь пожилым людям'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-20 11:45:00'
);

-- Отклик на событие 3 (Школа волонтеров)
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Школа волонтеров'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-21 09:15:00'
);

-- Отклик на событие 4 (Экологический поход)
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологический поход "Меняй себя, а не климат"'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-22 14:30:00'
);

-- Отклики на новые события (01.11 - 01.12)
-- Событие 6: Физзарядка для пенсионеров
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Физическая зарядка для пенсионеров'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-02 10:30:00'
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Физическая зарядка для пенсионеров'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-03 14:20:00'
);

-- Событие 7: Скандинавская ходьба
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Тренировка по скандинавской ходьбе'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-03 11:00:00'
);

-- Событие 8: Встреча с жителями
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Встреча с жителями микрорайона'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-11 15:45:00'
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Встреча с жителями микрорайона'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-12 09:30:00'
);

-- Событие 9: Экологический конкурс
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологический конкурс "Нескучная инженерия"'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-06 13:20:00'
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологический конкурс "Нескучная инженерия"'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-07 10:15:00'
);

-- Событие 10: Проект "Ни грамма скуки"
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Проект "Ни грамма скуки"'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-09 16:00:00'
);

-- Событие 11: Помощь молодым людям с инвалидностью
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Помощь молодым людям с инвалидностью'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-06 12:30:00'
);

-- Событие 12: Киберспортивный турнир
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Киберспортивный турнир для подростков'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-11 14:45:00'
);

-- Событие 13: Проект "Передышка"
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Проект "Передышка" для семей'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-13 11:20:00'
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Проект "Передышка" для семей'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-14 09:10:00'
);

-- Событие 14: Помощь бездомным животным
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция помощи бездомным животным'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-21 13:00:00'
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция помощи бездомным животным'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-22 10:30:00'
);

-- Событие 15: Занятия по альтернативной коммуникации
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Занятия по альтернативной коммуникации'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-23 15:20:00'
);

-- Событие 16: Новогоднее мероприятие
INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Новогоднее мероприятие для детей с инвалидностью'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  '2025-11-26 12:00:00'
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events WHERE name = 'Новогоднее мероприятие для детей с инвалидностью'),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  '2025-11-27 14:30:00'
);

-- ============================================
-- Новости
-- ============================================

-- Новость 1 от НКО #1
INSERT INTO news (user_id, npo_id, volunteer_id, admin_id, name, annotation, text, type, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo1'),
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  NULL,
  NULL,
  'Новая программа поддержки волонтёров',
  'Мы запускаем новую программу поддержки волонтёров. Теперь каждый активный волонтёр может получить сертификат и рекомендации для дальнейшего развития.',
  'Мы запускаем новую программу поддержки волонтёров. Теперь каждый активный волонтёр может получить сертификат и рекомендации для дальнейшего развития.',
  'BLOG',
  '2025-11-18 12:00:00'
);

-- Новость 2 от НКО #2
INSERT INTO news (user_id, npo_id, volunteer_id, admin_id, name, annotation, text, type, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo2'),
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  NULL,
  NULL,
  'Итоги акции помощи пожилым людям',
  'Благодарим всех волонтёров, принявших участие в акции. Вместе мы помогли более 50 пожилым людям!',
  'Благодарим всех волонтёров, принявших участие в акции. Вместе мы помогли более 50 пожилым людям!',
  'BLOG',
  '2025-11-22 16:30:00'
);

-- Новость 3 от НКО #3
INSERT INTO news (user_id, npo_id, volunteer_id, admin_id, name, annotation, text, type, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo3'),
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')),
  NULL,
  NULL,
  'Открыта регистрация на Школу волонтеров',
  'Приглашаем всех желающих присоединиться к нашему обучающему мероприятию. Регистрация открыта до 22 ноября.',
  'Приглашаем всех желающих присоединиться к нашему обучающему мероприятию. Регистрация открыта до 22 ноября.',
  'BLOG',
  '2025-11-20 10:00:00'
);

-- Новость 4 от волонтёра
INSERT INTO news (user_id, npo_id, volunteer_id, admin_id, name, annotation, text, type, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'vol1'),
  NULL,
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  NULL,
  'Мой опыт волонтёрства',
  'Хочу поделиться своим опытом участия в экологических акциях. Это было незабываемо! Рекомендую всем попробовать.',
  'Хочу поделиться своим опытом участия в экологических акциях. Это было незабываемо! Рекомендую всем попробовать.',
  'BLOG',
  '2025-11-19 14:20:00'
);

-- ============================================
-- Теги новостей
-- ============================================

INSERT INTO news_tags (news_id, tag)
VALUES (
  (SELECT id FROM news WHERE name = 'Новая программа поддержки волонтёров'),
  'Волонтёрство'
);

INSERT INTO news_tags (news_id, tag)
VALUES (
  (SELECT id FROM news WHERE name = 'Итоги акции помощи пожилым людям'),
  'Социальная помощь'
);

INSERT INTO news_tags (news_id, tag)
VALUES (
  (SELECT id FROM news WHERE name = 'Открыта регистрация на Школу волонтеров'),
  'Обучение'
);

INSERT INTO news_tags (news_id, tag)
VALUES (
  (SELECT id FROM news WHERE name = 'Мой опыт волонтёрства'),
  'Экология'
);

-- ============================================
-- База знаний
-- ============================================

-- Статья 1: Регистрация НКО
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как зарегистрировать НКО: пошаговая инструкция',
  'Регистрация некоммерческой организации (НКО) - это важный шаг для создания юридического лица, которое будет заниматься социально значимой деятельностью.

Шаг 1: Выбор организационно-правовой формы
- Автономная некоммерческая организация (АНО)
- Фонд
- Общественная организация
- Ассоциация (союз)

Шаг 2: Подготовка документов
- Устав организации
- Протокол учредительного собрания
- Заявление по форме РН0001
- Квитанция об уплате госпошлины (4000 рублей)

Шаг 3: Подача документов в Минюст
Документы подаются в территориальный орган Министерства юстиции РФ по месту нахождения организации.

Шаг 4: Получение документов
После проверки документов (срок до 30 дней) вы получите решение о регистрации и сможете забрать документы в Минюсте.

Шаг 5: Постановка на учет в налоговой
После регистрации необходимо встать на учет в налоговой инспекции и получить ИНН и ОГРН.',
  ARRAY['https://vkvideo.ru/video-227855624_456239197?list=ln-g0KNBizbaJD0XnTzgB'],
  NOW()
);

-- Статья 2: Управление НКО
INSERT INTO knowledges (name, text, created_at)
VALUES (
  'Основы управления некоммерческой организацией',
  'Эффективное управление НКО требует понимания специфики работы некоммерческого сектора и соблюдения законодательных требований.

Органы управления НКО:
1. Высший орган управления (общее собрание, конференция)
2. Постоянно действующий коллегиальный орган (совет, правление)
3. Единоличный исполнительный орган (директор, председатель)

Основные обязанности руководства:
- Разработка стратегии развития организации
- Планирование деятельности и бюджета
- Контроль за выполнением уставных целей
- Взаимодействие с государственными органами
- Отчетность перед учредителями и контролирующими органами

Финансовая отчетность:
НКО обязаны вести бухгалтерский учет и представлять отчетность в соответствии с требованиями законодательства. Ежегодно необходимо подавать отчет о деятельности в Минюст.

Работа с волонтерами:
Привлечение и координация волонтеров - важная часть работы многих НКО. Необходимо правильно оформлять отношения с волонтерами, обеспечивать их безопасность и мотивацию.',
  NOW()
);

-- Теги для базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges ORDER BY id LIMIT 1),
  'Регистрация НКО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges ORDER BY id LIMIT 1),
  'Документы'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges ORDER BY id LIMIT 1 OFFSET 1),
  'Управление НКО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges ORDER BY id LIMIT 1 OFFSET 1),
  'Организация работы'
);

-- ============================================
-- Координаты городов для карты
-- ============================================

INSERT INTO city_coordinates (city_name, center_lat, center_lon, zoom, created_at)
VALUES 
  ('Ангарск', 52.5444, 103.8889, 12, NOW()),
  ('Байкальск', 51.5158, 104.1403, 13, NOW()),
  ('Балаково', 52.0264, 47.8006, 12, NOW()),
  ('Билибино', 68.0586, 166.4419, 11, NOW()),
  ('Волгодонск', 47.5136, 42.1514, 12, NOW()),
  ('Глазов', 58.1364, 52.6586, 12, NOW()),
  ('Десногорск', 54.1539, 33.2917, 13, NOW()),
  ('Димитровград', 54.2167, 49.6181, 12, NOW()),
  ('Железногорск', 56.2508, 93.5319, 12, NOW()),
  ('Заречный (Пензенская область)', 53.2033, 45.1694, 13, NOW()),
  ('Заречный (Свердловская область)', 56.8106, 61.3258, 12, NOW()),
  ('ЗАТО Заречный', 53.2033, 45.1694, 13, NOW()),
  ('Заречный', 56.8106, 61.3258, 12, NOW()),
  ('Зеленогорск', 56.1083, 94.5986, 12, NOW()),
  ('Краснокаменск', 50.0978, 118.0358, 12, NOW()),
  ('Курчатов', 51.6603, 35.6569, 13, NOW()),
  ('Лесной', 58.6347, 59.7986, 12, NOW()),
  ('Неман', 55.0314, 22.0264, 13, NOW()),
  ('Нововоронеж', 51.3072, 39.2178, 13, NOW()),
  ('Новоуральск', 57.2472, 60.0833, 12, NOW()),
  ('Обнинск', 55.0969, 36.6103, 12, NOW()),
  ('Озерск', 55.7556, 60.7028, 12, NOW()),
  ('Озёрск', 55.7556, 60.7028, 12, NOW()),
  ('Певек', 69.7014, 170.2997, 11, NOW()),
  ('Полярные Зори', 67.3658, 32.4986, 13, NOW()),
  ('Саров', 54.9306, 43.3236, 12, NOW()),
  ('Северск', 56.6039, 84.8806, 12, NOW()),
  ('Снежинск', 56.085, 60.7314, 12, NOW()),
  ('Советск', 55.0806, 21.8819, 13, NOW()),
  ('Сосновый Бор', 59.9033, 29.0856, 12, NOW()),
  ('Трехгорный', 54.815, 58.4464, 12, NOW()),
  ('Удомля', 57.8789, 35.0094, 13, NOW()),
  ('Усолье-Сибирское', 52.7539, 103.6458, 12, NOW()),
  ('Электросталь', 55.7819, 38.4444, 12, NOW()),
  ('Энергодар', 47.4989, 34.6572, 13, NOW()),
  ('Нижний Новгород', 56.3269, 44.0075, 12, NOW()),
  ('Омск', 54.9885, 73.3242, 12, NOW())
ON CONFLICT (city_name) DO NOTHING;

-- ============================================
-- Просмотры профилей НКО (для статистики)
-- ============================================

-- Просмотры профиля НКО #1 (ОО ТОС АГО "12а микрорайон")
INSERT INTO npo_views (npo_id, viewer_id, viewed_at)
VALUES 
  -- 18 ноября
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-18 09:15:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-18 11:30:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), NULL, '2025-11-18 14:20:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-18 16:45:00'),
  -- 19 ноября
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-19 10:00:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), NULL, '2025-11-19 13:15:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-19 15:30:00'),
  -- 20 ноября
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-20 09:45:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), NULL, '2025-11-20 12:00:00'),
  -- 21 ноября
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-21 10:30:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-21 14:20:00'),
  -- 22 ноября
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), NULL, '2025-11-22 11:00:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-22 16:30:00'),
  -- 23 ноября
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-23 09:15:00'),
  -- 24 ноября
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-24 10:45:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')), NULL, '2025-11-24 13:30:00');

-- Просмотры профиля НКО #2
INSERT INTO npo_views (npo_id, viewer_id, viewed_at)
VALUES 
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-19 11:20:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')), NULL, '2025-11-20 15:00:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-21 12:45:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-22 10:30:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')), NULL, '2025-11-23 14:15:00');

-- Просмотры профиля НКО #3
INSERT INTO npo_views (npo_id, viewer_id, viewed_at)
VALUES 
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-20 09:00:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-21 11:30:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')), NULL, '2025-11-22 13:45:00'),
  ((SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-23 10:20:00');

-- ============================================
-- Просмотры событий (для статистики)
-- ============================================

-- Просмотры события 1 (Экологическая акция)
INSERT INTO event_views (event_id, viewer_id, viewed_at)
VALUES 
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-18 10:30:00'),
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-18 14:20:00'),
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), NULL, '2025-11-19 09:15:00'),
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-19 16:45:00'),
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-20 11:00:00'),
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), NULL, '2025-11-21 13:30:00'),
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-22 10:20:00'),
  ((SELECT id FROM events WHERE name = 'Экологическая акция "Чистый город"'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-23 15:10:00');

-- Просмотры события 2 (Помощь пожилым)
INSERT INTO event_views (event_id, viewer_id, viewed_at)
VALUES 
  ((SELECT id FROM events WHERE name = 'Волонтёрская помощь пожилым людям'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-19 12:00:00'),
  ((SELECT id FROM events WHERE name = 'Волонтёрская помощь пожилым людям'), NULL, '2025-11-20 14:30:00'),
  ((SELECT id FROM events WHERE name = 'Волонтёрская помощь пожилым людям'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-21 10:45:00'),
  ((SELECT id FROM events WHERE name = 'Волонтёрская помощь пожилым людям'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-22 09:30:00');

-- Просмотры события 3 (Школа волонтеров)
INSERT INTO event_views (event_id, viewer_id, viewed_at)
VALUES 
  ((SELECT id FROM events WHERE name = 'Школа волонтеров'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-20 11:15:00'),
  ((SELECT id FROM events WHERE name = 'Школа волонтеров'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-21 13:00:00'),
  ((SELECT id FROM events WHERE name = 'Школа волонтеров'), NULL, '2025-11-22 15:20:00'),
  ((SELECT id FROM events WHERE name = 'Школа волонтеров'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-23 09:45:00'),
  ((SELECT id FROM events WHERE name = 'Школа волонтеров'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-23 16:30:00');

-- Просмотры события 4 (Экологический поход)
INSERT INTO event_views (event_id, viewer_id, viewed_at)
VALUES 
  ((SELECT id FROM events WHERE name = 'Экологический поход "Меняй себя, а не климат"'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-21 10:00:00'),
  ((SELECT id FROM events WHERE name = 'Экологический поход "Меняй себя, а не климат"'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-22 12:30:00'),
  ((SELECT id FROM events WHERE name = 'Экологический поход "Меняй себя, а не климат"'), NULL, '2025-11-23 14:00:00'),
  ((SELECT id FROM events WHERE name = 'Экологический поход "Меняй себя, а не климат"'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-24 09:20:00');

-- Просмотры события 5 (Турнир по картингу)
INSERT INTO event_views (event_id, viewer_id, viewed_at)
VALUES 
  ((SELECT id FROM events WHERE name = 'Городской турнир по картингу'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-19 15:30:00'),
  ((SELECT id FROM events WHERE name = 'Городской турнир по картингу'), NULL, '2025-11-20 11:45:00'),
  ((SELECT id FROM events WHERE name = 'Городской турнир по картингу'), (SELECT id FROM users WHERE login = 'vol1'), '2025-11-21 14:15:00'),
  ((SELECT id FROM events WHERE name = 'Городской турнир по картингу'), (SELECT id FROM users WHERE login = 'vol2'), '2025-11-22 10:00:00');

COMMIT;

