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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo1'),
  'ОО ТОС АГО "12а микрорайон"',
  'Основная деятельность
Повышение качества жизни жителей 12а микрорайона г.Ангарска Иркутской области (Благоустройство и содержании территории, организация культурных, спортивных и социально значимых мероприятий, взаимодействие с органами власти для учёта мнения жителей, , экологии и социальной помощи.

ЦА
Жители микрорайона 12А (социально незащищенные группы: пенсионеры, инвалиды, многодетные семьи, малоимущие и д.р. дети и молодежь, собственники жилья.)

План мероприятий на год
1) Физическая зарядка для пенсионеров каждый четверг
2) Каждую пятницу тренировки по скандинавской ходьбе для всех возрастов. 
3) До 30.10.2025 установка детской эко-площадки и открытие площадки.
  4) Раз в месяц встречи с жителями по обсуждению проблем на территории и пути решения.',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
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
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
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
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo4'),
  'Культурная база "Короленко 8" (МБУ "ЦМиТО УКСиМП"',
  'Основная деятельность:  
Ресурсный центр помощи НКО и сообществам, учреждениям культуры, образования

ЦА: 
Инициативные жители, сообщества, НКО, учреждения города',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
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
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo6'),
  'Федерация картинга',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo7'),
  'НКО "Резервный фонд поддержки гражданских инициатив города Зеленогорска"',
  'Три года назад Фонд планировали закрывать. Потом он стал площадкой по сбору средст в поддержку волонтеров СВО, т.к. других фондов в городе нет. 

Основаная детельность:
На сегодня принято решение оставить Фонд после окончания СВО. Он будет заниматься сбором пожертвований и помощью людям в тяжелых ситуациях (пожары, болезни и т.п.). 

ЦА:  
люди в сложной жизненой ситуации',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo8'),
  'АНО "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo9'),
  'АНО РАЗВИВАЮЩИЙ ЦЕНТР "СОЛНЕЧНЫЙ ГОРОД" "',
  'Основаная детельность:
Оказание психолого-педагогической помощи семьям с детьми,  в том числе с инвалидностью и ОВЗ

ЦА: 
Семьи с детьми от рождения до 18 лет

План мероприятий на год: 
Проект "Передышка" (поддержан КЦПРОИ)',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo10'),
  'АНО КРЦРМСИГ ЕЛЕНЫ ЖИВАЕВОЙ',
  'Информация об организации АНО КРЦРМСИГ Елены Живаевой',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo11'),
  'АНО Ресурсный центр',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
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
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo13'),
  'АНО Центр досуга и развития детей',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo14'),
  'Автономная некоммерческая организация "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"',
  'Основная деятельность: 
ОКВЭД 93.12 - Деятельность спортивных клубов. А если по факту, то занимаюсь развитием компьютерного спорта и фиджитал-спорта в нашем городе, проведением мероприятий, турниров и просветительской работой в этой области

Ца: подростки 12-17 лет, а также их родители. С первыми ведем непосредственную работу по развитию их навыков в киберспорте и фиджитале, а со вторыми веду просветительскую работу и просто рассказываю, что киберспорт это не бесконтрольный гейминг и не игромания, а такое же спортивное направление, как футбол, шахматы и так далее, он также развивает определенные навыки, и дети там также получают определенные знания и необходимую для них в наше время социализацию.

План мероприятий до конца года 
В планах до конца года открыть детский клуб, уже подготовительные работы ведутся, смета на оборудование подготовлена, но основная проблема в его дороговизне. Открыть клуб на 10 компьютеров, две приставки и 1 VR-шлем даже не на топовом оборудовании, но на более-менее актуальном, стоит по моим подсчетам порядка полутора миллионов. Это без затрат на ремонт и остальные расходы',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo15'),
  'БФ «Планета кошек»',
  'Благотворительный Фонд "Планета Кошек" — это проект помощи бездомным животным в Нижнем Новгороде!

Благотворительный Фонд "Планета Кошек" входит в состав многофункционального Центра помощи и реабилитации животных. Деятельность Фонда направлена на спасение животных, оказавшихся в сложных жизненных ситуация, брошенных на улице, нуждающихся в ветеринарной помощи!',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo16'),
  'АНО ДПО "Техническая академия Росатома"',
  'На данный момент НКО нет. Находится на стадии формирования концепции и формализации идеи.',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
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
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo18'),
  'ТРОО "ВПЦ" МИРНЫЙ ВОИН"',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo19'),
  'СГОО БУМЕРАНГ ДОБРА',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo20'),
  'ДоброЦентр при СО НКО Бумеранг добра',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
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
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo22'),
  'БФМС Новое Усолье',
  'Основная деятельность: 
Активизация/развитие местного сообщества для улучшения жизни в городе

ЦА:
Неравнодушные жители, женщины 40+, семьи с детьми',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo23'),
  'УГМО ИОРОООО ВОИ',
  'Основная деятельность:
Организация работает по поддержке людей с инвалидностью и развитию адаптивной физической культуры и спорта в городе. Группа изучает более 25 человек различных нозологических групп. 

ЦА: 
Люди с инвалидностью всех возрастов',
  NULL,
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

INSERT INTO npos (user_id, name, description, page_content, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo24'),
  'АНО «Твердыми шагами»',
  'Автономная некоммерческая организация помощи детям с ограниченными возможностями здоровья, инвалидностью и их семьям.',
  NULL,
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

-- Событие 17: Мастер-класс по рукоделию (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Мастер-класс по рукоделию для пенсионеров',
  'Творческий мастер-класс по изготовлению новогодних поделок. Все материалы предоставляются.',
  '2025-11-25 14:00:00',
  '2025-11-25 17:00:00',
  52.5444,
  103.8889,
  20,
  'Ангарск',
  'PUBLISHED',
  '2025-11-22 10:00:00'
);

-- Событие 18: Благотворительная ярмарка (для НКО #2)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  'Благотворительная ярмарка "Доброе сердце"',
  'Ярмарка поделок и сувениров ручной работы. Все средства пойдут на помощь социально незащищенным слоям населения.',
  '2025-11-26 11:00:00',
  '2025-11-26 16:00:00',
  47.5136,
  42.1514,
  100,
  'Волгодонск',
  'PUBLISHED',
  '2025-11-23 09:00:00'
);

-- Событие 19: Лекция по здоровому образу жизни (для НКО #3)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')),
  'Лекция "Здоровый образ жизни в зрелом возрасте"',
  'Встреча с врачом-геронтологом о правильном питании, физической активности и профилактике заболеваний.',
  '2025-11-27 15:00:00',
  '2025-11-27 17:00:00',
  58.1394,
  52.6583,
  40,
  'Глазов',
  'PUBLISHED',
  '2025-11-24 11:00:00'
);

-- Событие 20: Экологический субботник (для НКО #5)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo5')),
  'Экологический субботник "Чистый парк"',
  'Уборка территории городского парка от мусора и листвы. Приглашаем всех желающих внести вклад в чистоту города.',
  '2025-11-29 09:00:00',
  '2025-11-29 13:00:00',
  56.2511,
  93.5319,
  50,
  'Железногорск',
  'PUBLISHED',
  '2025-11-26 08:00:00'
);

-- Событие 21: Спортивный турнир (для НКО #6)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo6')),
  'Городской турнир по настольному теннису',
  'Соревнования по настольному теннису для всех возрастов. Регистрация участников обязательна.',
  '2025-11-30 10:00:00',
  '2025-11-30 18:00:00',
  56.1128,
  94.5981,
  32,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-26 12:00:00'
);

-- Событие 22: Концерт для ветеранов (для НКО #7)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo7')),
  'Концерт "Песни нашей молодости"',
  'Музыкальный вечер для ветеранов с исполнением любимых песен. Теплая атмосфера и чаепитие.',
  '2025-12-02 16:00:00',
  '2025-12-02 19:00:00',
  56.1128,
  94.5981,
  60,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-26 10:00:00'
);

-- Событие 23: Встреча с психологом (для НКО #9)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo9')),
  'Групповая встреча с психологом "Семейные отношения"',
  'Бесплатная консультация для семей по вопросам детско-родительских отношений и семейной гармонии.',
  '2025-12-03 18:00:00',
  '2025-12-03 20:00:00',
  56.1128,
  94.5981,
  15,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-26 14:00:00'
);

-- Событие 24: Мастер-класс по программированию (для НКО #8)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo8')),
  'Мастер-класс "Основы программирования для детей"',
  'Обучающее занятие для детей 10-14 лет по основам программирования на языке Python.',
  '2025-12-04 15:00:00',
  '2025-12-04 17:00:00',
  56.1128,
  94.5981,
  20,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 25: Акция помощи бездомным (для НКО #15)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo15')),
  'Акция "Теплая зима" для бездомных',
  'Сбор теплой одежды, обуви и продуктов питания для людей без определенного места жительства.',
  '2025-12-05 10:00:00',
  '2025-12-05 15:00:00',
  56.3269,
  44.0075,
  25,
  'Нижний Новгород',
  'PUBLISHED',
  '2025-11-25 08:00:00'
);

-- Событие 26: Занятия для детей с ОВЗ (для НКО #17)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo17')),
  'Развивающие занятия для детей с ОВЗ',
  'Индивидуальные и групповые занятия по развитию речи, моторики и коммуникативных навыков.',
  '2025-12-06 10:00:00',
  '2025-12-06 13:00:00',
  54.9885,
  73.3242,
  12,
  'Омск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 27: Экскурсия для пенсионеров (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Экскурсия в музей для пенсионеров',
  'Бесплатная экскурсия в краеведческий музей для людей старшего возраста. Транспорт предоставляется.',
  '2025-12-07 11:00:00',
  '2025-12-07 14:00:00',
  52.5444,
  103.8889,
  30,
  'Ангарск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 28: Волонтерская помощь (для НКО #2)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  'Волонтерская помощь многодетным семьям',
  'Помощь в уборке квартир, покупке продуктов и присмотре за детьми для многодетных семей.',
  '2025-12-08 09:00:00',
  '2025-12-08 15:00:00',
  47.5136,
  42.1514,
  20,
  'Волгодонск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 29: Творческая мастерская (для НКО #4)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo4')),
  'Творческая мастерская "Новогодние игрушки"',
  'Мастер-класс по изготовлению елочных игрушек своими руками. Подходит для всей семьи.',
  '2025-12-09 14:00:00',
  '2025-12-09 17:00:00',
  58.1394,
  52.6583,
  25,
  'Глазов',
  'PUBLISHED',
  '2025-11-25 11:00:00'
);

-- Событие 30: Экологическая лекция (для НКО #5)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo5')),
  'Лекция "Экология в быту"',
  'Познавательная лекция о том, как сделать свой дом более экологичным и снизить вредное воздействие на природу.',
  '2025-12-10 18:00:00',
  '2025-12-10 20:00:00',
  56.2511,
  93.5319,
  35,
  'Железногорск',
  'PUBLISHED',
  '2025-11-25 12:00:00'
);

-- Событие 31: Спортивное мероприятие (для НКО #6)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo6')),
  'Спортивный праздник "Здоровье - это сила"',
  'Соревнования по различным видам спорта для детей и взрослых. Награждение победителей.',
  '2025-12-11 10:00:00',
  '2025-12-11 16:00:00',
  56.1128,
  94.5981,
  60,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 32: Концерт для детей (для НКО #10)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo10')),
  'Детский новогодний концерт',
  'Праздничный концерт с участием детских творческих коллективов. Вход свободный.',
  '2025-12-12 15:00:00',
  '2025-12-12 17:00:00',
  56.1128,
  94.5981,
  80,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 33: Помощь пожилым (для НКО #11)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo11')),
  'Акция "Забота о старших"',
  'Волонтерская помощь пожилым людям: уборка квартир, покупка продуктов, сопровождение в поликлинику.',
  '2025-12-13 09:00:00',
  '2025-12-13 14:00:00',
  56.1128,
  94.5981,
  15,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 08:00:00'
);

-- Событие 34: Образовательный семинар (для НКО #12)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo12')),
  'Семинар "Финансовая грамотность для пенсионеров"',
  'Полезный семинар о том, как правильно распоряжаться пенсией, защищаться от мошенников и планировать бюджет.',
  '2025-12-14 14:00:00',
  '2025-12-14 16:00:00',
  56.1128,
  94.5981,
  40,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 35: Новогодняя елка (для НКО #24)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo24')),
  'Новогодняя елка для детей с ОВЗ',
  'Праздничное мероприятие с Дедом Морозом, Снегурочкой, подарками и развлечениями для детей с ограниченными возможностями здоровья.',
  '2025-12-15 12:00:00',
  '2025-12-15 16:00:00',
  55.7556,
  60.7028,
  30,
  'Озёрск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 36: Благотворительный концерт (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Благотворительный концерт "Музыка добра"',
  'Концерт местных артистов в поддержку социальных программ. Все собранные средства пойдут на помощь нуждающимся.',
  '2025-12-16 18:00:00',
  '2025-12-16 21:00:00',
  52.5444,
  103.8889,
  100,
  'Ангарск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 37: Мастер-класс по кулинарии (для НКО #2)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  'Кулинарный мастер-класс "Новогодние блюда"',
  'Обучение приготовлению праздничных блюд для новогоднего стола. Все участники получат рецепты.',
  '2025-12-17 16:00:00',
  '2025-12-17 19:00:00',
  47.5136,
  42.1514,
  20,
  'Волгодонск',
  'PUBLISHED',
  '2025-11-25 11:00:00'
);

-- Событие 38: Экологическая акция (для НКО #5)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo5')),
  'Акция "Раздельный сбор мусора"',
  'Информационная акция о важности раздельного сбора отходов. Практический мастер-класс по сортировке.',
  '2025-12-18 11:00:00',
  '2025-12-18 14:00:00',
  56.2511,
  93.5319,
  45,
  'Железногорск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 39: Встреча с ветеранами (для НКО #3)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo3')),
  'Встреча "Истории наших дедов"',
  'Теплая встреча с ветеранами, где они поделятся воспоминаниями о военных годах и послевоенном времени.',
  '2025-12-19 15:00:00',
  '2025-12-19 18:00:00',
  58.1394,
  52.6583,
  35,
  'Глазов',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 40: Помощь животным (для НКО #15)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo15')),
  'Акция "Подари дом бездомному другу"',
  'Сбор средств и корма для приюта бездомных животных. Возможность взять питомца домой.',
  '2025-12-20 10:00:00',
  '2025-12-20 16:00:00',
  56.3269,
  44.0075,
  40,
  'Нижний Новгород',
  'PUBLISHED',
  '2025-11-25 08:00:00'
);

-- Событие 41: Новогодний утренник (для НКО #17)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo17')),
  'Новогодний утренник для детей',
  'Праздничное представление с играми, конкурсами и подарками для детей всех возрастов.',
  '2025-12-21 11:00:00',
  '2025-12-21 14:00:00',
  54.9885,
  73.3242,
  60,
  'Омск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 42: Спортивный забег (для НКО #6)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo6')),
  'Благотворительный забег "Новогодняя миля"',
  'Спортивное мероприятие для всех желающих. Регистрационный взнос идет на благотворительность.',
  '2025-12-22 09:00:00',
  '2025-12-22 12:00:00',
  56.1128,
  94.5981,
  80,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 08:00:00'
);

-- Событие 43: Творческий вечер (для НКО #7)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo7')),
  'Творческий вечер "Поэзия и музыка"',
  'Вечер поэзии и живой музыки. Выступление местных поэтов и музыкантов.',
  '2025-12-23 18:00:00',
  '2025-12-23 21:00:00',
  56.1128,
  94.5981,
  50,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 44: Помощь семьям (для НКО #9)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo9')),
  'Акция "Новогодний подарок для семьи"',
  'Сбор подарков и продуктовых наборов для малоимущих семей с детьми.',
  '2025-12-24 10:00:00',
  '2025-12-24 15:00:00',
  56.1128,
  94.5981,
  30,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 45: Новогодний бал (для НКО #10)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo10')),
  'Новогодний бал для молодежи',
  'Торжественный бал с танцами, конкурсами и развлечениями для молодых людей 16-25 лет.',
  '2025-12-25 19:00:00',
  '2025-12-25 23:00:00',
  56.1128,
  94.5981,
  100,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 11:00:00'
);

-- Событие 46: Мастер-класс по рисованию (для НКО #11)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo11')),
  'Мастер-класс "Рисуем зиму"',
  'Творческое занятие по рисованию зимних пейзажей для детей и взрослых. Все материалы предоставляются.',
  '2025-12-26 14:00:00',
  '2025-12-26 17:00:00',
  56.1128,
  94.5981,
  25,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 47: Лекция о здоровье (для НКО #12)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo12')),
  'Лекция "Зимнее здоровье"',
  'Встреча с врачом о профилактике простудных заболеваний и поддержании иммунитета в зимний период.',
  '2025-12-27 16:00:00',
  '2025-12-27 18:00:00',
  56.1128,
  94.5981,
  45,
  'Зеленогорск',
  'PUBLISHED',
  '2025-11-25 11:00:00'
);

-- Событие 48: Помощь детям (для НКО #24)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo24')),
  'Акция "Подари ребенку праздник"',
  'Сбор игрушек, книг и сладостей для детей из малоимущих семей и детских домов.',
  '2025-12-28 11:00:00',
  '2025-12-28 16:00:00',
  55.7556,
  60.7028,
  35,
  'Озёрск',
  'PUBLISHED',
  '2025-11-25 09:00:00'
);

-- Событие 49: Новогодний концерт (для НКО #1)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo1')),
  'Новогодний концерт "Встречаем 2026"',
  'Большой праздничный концерт с участием творческих коллективов города. Встреча Нового года.',
  '2025-12-29 18:00:00',
  '2025-12-30 01:00:00',
  52.5444,
  103.8889,
  150,
  'Ангарск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
);

-- Событие 50: Благотворительная акция (для НКО #2)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo2')),
  'Акция "Новогоднее чудо"',
  'Масштабная благотворительная акция по сбору подарков и средств для нуждающихся семей.',
  '2025-12-30 10:00:00',
  '2025-12-30 17:00:00',
  47.5136,
  42.1514,
  50,
  'Волгодонск',
  'PUBLISHED',
  '2025-11-25 08:00:00'
);

-- Событие 51: Новогодняя елка (для НКО #17)
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos WHERE user_id = (SELECT id FROM users WHERE login = 'npo17')),
  'Главная новогодняя елка для детей с инвалидностью',
  'Торжественное новогоднее представление с Дедом Морозом, подарками и праздничной программой.',
  '2025-12-31 15:00:00',
  '2025-12-31 19:00:00',
  54.9885,
  73.3242,
  80,
  'Омск',
  'PUBLISHED',
  '2025-11-25 10:00:00'
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

-- Теги для новых событий (25.11.2025 - 31.12.2025)
INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Мастер-класс по рукоделию для пенсионеров'),
  'Творчество'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Благотворительная ярмарка "Доброе сердце"'),
  'Благотворительность'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Лекция "Здоровый образ жизни в зрелом возрасте"'),
  'Здоровье'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Экологический субботник "Чистый парк"'),
  'Экология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Городской турнир по настольному теннису'),
  'Спорт'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Концерт "Песни нашей молодости"'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Групповая встреча с психологом "Семейные отношения"'),
  'Психология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Мастер-класс "Основы программирования для детей"'),
  'Образование'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция "Теплая зима" для бездомных'),
  'Социальная помощь'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Развивающие занятия для детей с ОВЗ'),
  'Образование'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Экскурсия в музей для пенсионеров'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Волонтерская помощь многодетным семьям'),
  'Социальная помощь'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Творческая мастерская "Новогодние игрушки"'),
  'Творчество'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Лекция "Экология в быту"'),
  'Экология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Спортивный праздник "Здоровье - это сила"'),
  'Спорт'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Детский новогодний концерт'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция "Забота о старших"'),
  'Пожилые люди'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Семинар "Финансовая грамотность для пенсионеров"'),
  'Обучение'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Новогодняя елка для детей с ОВЗ'),
  'Социальная помощь'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Благотворительный концерт "Музыка добра"'),
  'Благотворительность'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Кулинарный мастер-класс "Новогодние блюда"'),
  'Творчество'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция "Раздельный сбор мусора"'),
  'Экология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Встреча "Истории наших дедов"'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция "Подари дом бездомному другу"'),
  'Защита животных'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Новогодний утренник для детей'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Благотворительный забег "Новогодняя миля"'),
  'Спорт'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Творческий вечер "Поэзия и музыка"'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция "Новогодний подарок для семьи"'),
  'Социальная помощь'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Новогодний бал для молодежи'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Мастер-класс "Рисуем зиму"'),
  'Творчество'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Лекция "Зимнее здоровье"'),
  'Здоровье'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция "Подари ребенку праздник"'),
  'Социальная помощь'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Новогодний концерт "Встречаем 2026"'),
  'Культура'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Акция "Новогоднее чудо"'),
  'Благотворительность'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events WHERE name = 'Главная новогодняя елка для детей с инвалидностью'),
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
  '2025-11-27 10:30:00'
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
  'THEME',
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
  'THEME',
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
  'THEME',
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
  'THEME',
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

-- Статья 3: Курс «НКО: от идеи до реализации» - Зачем мы? Как мы меняем мир?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «НКО: от идеи до реализации» - Зачем мы? Как мы меняем мир? Проблема, видение, социальные эффекты, импакт',
  'Видео-лекция из курса «НКО: от идеи до реализации» на тему "Зачем мы? Как мы меняем мир? Проблема, видение, социальные эффекты, импакт".

Спикер: Андрей Андрусов

В этом материале рассматриваются ключевые вопросы создания и развития некоммерческой организации:
- Определение социальной проблемы, которую решает НКО
- Формулирование видения и миссии организации
- Измерение социальных эффектов деятельности
- Оценка импакта (социального воздействия) организации

Материал поможет начинающим НКО правильно сформулировать свою миссию и понять, как измерить эффективность своей деятельности.',
  ARRAY['https://rutube.ru/video/private/813e814fabecba124457841793492765/?p=li06oNnLfsRdK6rBqj0QOQ'],
  NOW()
);

-- Статья 4: Курс «НКО: от идеи до реализации» - Как менять мир системно?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «НКО: от идеи до реализации» - Как менять мир системно?',
  'Видео-лекция из курса «НКО: от идеи до реализации» на тему "Как менять мир системно?".

В этом материале рассматриваются подходы к системному решению социальных проблем:
- Системное мышление в социальной сфере
- Построение устойчивых моделей социальных изменений
- Создание экосистемы для решения проблем
- Долгосрочное планирование и стратегия развития

Материал поможет НКО перейти от точечных решений к системным изменениям в обществе.',
  ARRAY['https://rutube.ru/video/private/f495991115a29c09c9cfda03b02509db/?p=Crhqe05KaW9HBBqlMM7LYQ'],
  NOW()
);

-- Статья 5: Курс «НКО: от идеи до реализации» - Что именно мы предлагаем?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «НКО: от идеи до реализации» - Что именно мы предлагаем?',
  'Видео-лекция из курса «НКО: от идеи до реализации» на тему "Что именно мы предлагаем?".

В этом материале рассматриваются вопросы формирования продуктов и услуг НКО:
- Определение продуктов и услуг организации
- Уникальное ценностное предложение НКО
- Разработка программ и проектов
- Позиционирование организации на рынке социальных услуг

Материал поможет НКО четко сформулировать, что именно они предлагают своим благополучателям и партнерам.',
  ARRAY['https://rutube.ru/video/private/647e23994fdb231bd2cc499cb5bea688/?p=PZU5pnvGjha_VlAjlfWUMw'],
  NOW()
);

-- Статья 6: Курс «НКО: от идеи до реализации» - Где найти деньги на мою НКО: базовый фандрайзинг
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «НКО: от идеи до реализации» - Где найти деньги на мою НКО: базовый фандрайзинг',
  'Видео-лекция из курса «НКО: от идеи до реализации» на тему "Где найти деньги на мою НКО: базовый фандрайзинг".

Спикер: Анастасия Москвина

В этом материале рассматриваются основы фандрайзинга для НКО:
- Основные источники финансирования НКО
- Стратегии привлечения средств
- Работа с донорами и спонсорами
- Краудфандинг и другие современные инструменты
- Планирование фандрайзинговой кампании

Материал поможет НКО освоить базовые навыки привлечения финансирования для своей деятельности.',
  ARRAY['https://rutube.ru/video/private/eab96d267b455c8e33288228f4a7a845/?p=NSloLWbf1ATI9bd-Y2IOaw'],
  NOW()
);

-- Статья 7: Курс «НКО: от идеи до реализации» - Как написать/улучшить грантовую заявку? Где искать гранты?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «НКО: от идеи до реализации» - Как написать/улучшить грантовую заявку? Где искать гранты?',
  'Видео-лекция из курса «НКО: от идеи до реализации» на тему "Как написать/улучшить грантовую заявку? Где искать гранты?".

В этом материале рассматриваются практические аспекты работы с грантами:
- Где искать информацию о грантах и конкурсах
- Структура и требования грантовой заявки
- Как правильно описать проект и его цели
- Бюджет проекта и обоснование расходов
- Типичные ошибки при написании заявок
- Как улучшить уже поданную заявку

Материал поможет НКО повысить шансы на получение грантового финансирования.',
  ARRAY['https://rutube.ru/video/private/6dc76376dcbd784f06e0d2951ca4b75a/?p=86OIrn-JNS4ZDBO-CJ2-mw'],
  NOW()
);

-- Статья 8: Курс «НКО: от идеи до реализации» - Социальное предпринимательство в НКО: Кто купит мой продукт? Портрет клиента
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «НКО: от идеи до реализации» - Социальное предпринимательство в НКО: Кто купит мой продукт? Портрет клиента',
  'Видео-лекция из курса «НКО: от идеи до реализации» на тему "Социальное предпринимательство в НКО: Кто купит мой продукт? Портрет клиента".

В этом материале рассматриваются основы социального предпринимательства:
- Понятие социального предпринимательства в НКО
- Определение целевой аудитории и портрета клиента
- Сегментация рынка социальных услуг
- Исследование потребностей целевой группы
- Разработка продуктов и услуг под потребности клиентов
- Монетизация социальных проектов

Материал поможет НКО развивать предпринимательские подходы и создавать устойчивые бизнес-модели.',
  ARRAY['https://rutube.ru/video/private/1e0094eea4ea3c56578861683bdf5a44/?p=tQ4O8m4c90do9BQNL4-crA'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зачем мы? Как мы меняем мир?%'),
  'Курс НКО: от идеи до реализации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зачем мы? Как мы меняем мир?%'),
  'Миссия и видение'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зачем мы? Как мы меняем мир?%'),
  'Социальный импакт'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как менять мир системно?%'),
  'Курс НКО: от идеи до реализации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как менять мир системно?%'),
  'Системное мышление'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Что именно мы предлагаем?%'),
  'Курс НКО: от идеи до реализации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Что именно мы предлагаем?%'),
  'Продукты и услуги НКО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Где найти деньги на мою НКО%'),
  'Курс НКО: от идеи до реализации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Где найти деньги на мою НКО%'),
  'Фандрайзинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как написать/улучшить грантовую заявку%'),
  'Курс НКО: от идеи до реализации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как написать/улучшить грантовую заявку%'),
  'Гранты'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как написать/улучшить грантовую заявку%'),
  'Проектные заявки'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Социальное предпринимательство%'),
  'Курс НКО: от идеи до реализации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Социальное предпринимательство%'),
  'Социальное предпринимательство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Социальное предпринимательство%'),
  'Целевая аудитория'
);

-- Статья 9: Основные задачи PR: Что важно для успешного развития организации?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Основные задачи PR: Что важно для успешного развития организации?',
  'Видео-лекция на тему "Основные задачи PR: Что важно для успешного развития организации?".

Спикер: Анастасия Андронова

В этом материале рассматриваются ключевые аспекты PR-деятельности для НКО:
- Основные задачи PR в некоммерческом секторе
- Построение репутации организации
- Работа с медиа и общественностью
- Коммуникационные стратегии для НКО
- Инструменты и методы PR-продвижения

Материал поможет НКО понять важность PR-деятельности и использовать ее для успешного развития организации.',
  ARRAY['https://rutube.ru/video/private/5ab07931de97542a992e02af3ac1b769/?p=j7_LjN6AefoCVczu3-ywZQ'],
  NOW()
);

-- Статья 10: Организация мероприятий и их PR-поддержка
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Организация мероприятий и их PR-поддержка',
  'Видео-лекция на тему "Организация мероприятий и их PR-поддержка".

В этом материале рассматриваются практические аспекты организации мероприятий и их продвижения:
- Планирование и организация мероприятий НКО
- PR-стратегия для мероприятий
- Привлечение внимания к событию
- Работа со СМИ и партнерами
- Измерение эффективности PR-кампании мероприятия

Материал поможет НКО эффективно организовывать мероприятия и привлекать к ним внимание целевой аудитории.',
  ARRAY['https://rutube.ru/video/private/7a34f7dbf26b88238ad6332e79e75f52/?p=IWgmgLvUv6dmvL5Mh4ZBmA'],
  NOW()
);

-- Статья 11: Взаимосвязь PR и GR в построении узнаваемого бренда
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Взаимосвязь PR и GR в построении узнаваемого бренда',
  'Видео-лекция на тему "Взаимосвязь PR и GR в построении узнаваемого бренда".

В этом материале рассматриваются вопросы построения бренда НКО через интеграцию PR и GR:
- Понятие PR (Public Relations) и GR (Government Relations)
- Взаимосвязь между PR и GR в работе НКО
- Построение узнаваемого бренда организации
- Работа с государственными структурами
- Комплексный подход к коммуникациям

Материал поможет НКО выстроить эффективную систему коммуникаций с различными стейкхолдерами.',
  ARRAY['https://rutube.ru/video/private/a00542232213fde679ea046df7baa1e1/?p=9oH-86YX9uDcKq4y1fmkuQ'],
  NOW()
);

-- Статья 12: Команда НКО: От набора людей к сильному коллективу
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Команда НКО: От набора людей к сильному коллективу',
  'Видео-лекция на тему "Команда НКО: От набора людей к сильному коллективу".

Спикер: Алексей Мокеев

В этом материале рассматриваются вопросы формирования и развития команды в НКО:
- Процесс подбора и найма сотрудников
- Формирование команды из отдельных людей
- Создание корпоративной культуры
- Мотивация и вовлеченность команды
- Превращение группы людей в эффективный коллектив

Материал поможет НКО построить сильную и сплоченную команду для достижения целей организации.',
  ARRAY['https://rutube.ru/video/private/2be0340e8fe622c326250f8bbbdf8dd9/?p=LR6AxyBYP3Mo6vpzpDS9KQ'],
  NOW()
);

-- Статья 13: Управление командой: Инструменты руководителя НКО
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Управление командой: Инструменты руководителя НКО, стили управления в НКО, делегирование и контроль, выстраивание процессов коммуникации',
  'Видео-лекция на тему "Управление командой: Инструменты руководителя НКО, стили управления в НКО, делегирование и контроль, выстраивание процессов коммуникации".

В этом материале рассматриваются практические инструменты управления командой в НКО:
- Инструменты и методы управления командой
- Стили управления и их применение в НКО
- Делегирование задач и полномочий
- Контроль выполнения задач
- Выстраивание эффективных процессов коммуникации в команде

Материал поможет руководителям НКО эффективно управлять командой и достигать поставленных целей.',
  ARRAY['https://rutube.ru/video/private/af878f72a14766de40a1237a461b9f46/?p=5TUDn_w3_-fk8vP4kSmyQg'],
  NOW()
);

-- Статья 14: Развитие и удержание команды в долгосрочной перспективе
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Развитие и удержание команды в долгосрочной перспективе',
  'Видео-лекция на тему "Развитие и удержание команды в долгосрочной перспективе".

В этом материале рассматриваются стратегии долгосрочного развития и удержания команды:
- Планирование развития команды на перспективу
- Программы обучения и развития сотрудников
- Системы мотивации и удержания персонала
- Создание условий для профессионального роста
- Работа с текучестью кадров

Материал поможет НКО создать условия для долгосрочного развития и удержания ценных сотрудников.',
  ARRAY['https://rutube.ru/video/private/1a5b1ee456e1dc4778371abf6ae5c957/?p=N6DXp_ckkqIWSVjxlfpg9g'],
  NOW()
);

-- Статья 15: Зелёный офис — Концепция «Зелёный офис». С чего начать?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Зелёный офис — Концепция «Зелёный офис». С чего начать?',
  'Видео-лекция на тему "Зелёный офис — Концепция «Зелёный офис». С чего начать?".

Спикеры: Ольга Шкабардня, Евгения Кузнецова

В этом материале рассматриваются основы концепции "Зелёный офис":
- Понятие и принципы "Зелёного офиса"
- С чего начать внедрение экологических практик в офисе
- Основные направления экологизации офисного пространства
- Экономические и экологические преимущества
- Первые шаги для организации

Материал поможет организациям начать путь к созданию экологически ответственного офисного пространства.',
  ARRAY['https://vkvideo.ru/video-172285001_456239301'],
  NOW()
);

-- Статья 16: Зелёный офис: от слов к делу
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Зелёный офис: от слов к делу',
  'Видео-лекция на тему "Зелёный офис: от слов к делу".

Спикер: Ксения Лопаткина

В этом материале рассматриваются практические шаги по реализации концепции "Зелёный офис":
- Переход от планирования к реализации
- Конкретные действия и инициативы
- Преодоление барьеров при внедрении
- Измерение результатов
- Лучшие практики и кейсы

Материал поможет организациям перейти от теоретического понимания к практической реализации экологических инициатив в офисе.',
  ARRAY['https://vkvideo.ru/video-172285001_456239300'],
  NOW()
);

-- Статья 17: Как привлекать и вовлекать сотрудников в инициативы «зеленого» офиса компании
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как привлекать и вовлекать сотрудников в инициативы «зеленого» офиса компании',
  'Видео-лекция на тему "Как привлекать и вовлекать сотрудников в инициативы «зеленого» офиса компании".

Спикер: Александра Лавренко

В этом материале рассматриваются методы вовлечения сотрудников в экологические инициативы:
- Стратегии привлечения сотрудников к экологическим проектам
- Методы мотивации и вовлечения
- Создание экологической культуры в организации
- Коммуникация экологических инициатив
- Преодоление сопротивления изменениям

Материал поможет организациям эффективно вовлекать сотрудников в экологические инициативы и создавать устойчивую экологическую культуру.',
  ARRAY['https://vkvideo.ru/video-172285001_456239299'],
  NOW()
);

-- Статья 18: Путь от возникновения идеи до получения локальных и глобальных результатов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Путь от возникновения идеи до получения локальных и глобальных результатов',
  'Видео-лекция на тему "Путь от возникновения идеи до получения локальных и глобальных результатов".

Спикер: Юрий Калашников

В этом материале рассматривается процесс реализации экологических инициатив от идеи до результатов:
- От идеи к реализации проекта
- Планирование и этапы внедрения
- Достижение локальных результатов
- Масштабирование и глобальные эффекты
- Измерение и оценка результатов

Материал поможет организациям понять полный цикл реализации экологических проектов и достичь значимых результатов.',
  ARRAY['https://vkvideo.ru/video-172285001_456239298'],
  NOW()
);

-- Статья 19: Вовлечение сотрудников в концепцию «Зеленого офиса»
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Вовлечение сотрудников в концепцию «Зеленого офиса»',
  'Видео-лекция на тему "Вовлечение сотрудников в концепцию «Зеленого офиса»".

Спикер: Екатерина Тышковская

В этом материале рассматриваются практические подходы к вовлечению сотрудников:
- Методы вовлечения сотрудников в экологические практики
- Создание мотивации для участия
- Образовательные программы и тренинги
- Создание сообщества единомышленников
- Измерение уровня вовлеченности

Материал поможет организациям создать активное сообщество сотрудников, вовлеченных в экологические инициативы.',
  ARRAY['https://vkvideo.ru/video-172285001_456239297'],
  NOW()
);

-- Статья 20: Подведение итогов курса. Ответы на часто задаваемые вопросы
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Подведение итогов курса. Ответы на часто задаваемые вопросы',
  'Видео-лекция на тему "Подведение итогов курса. Ответы на часто задаваемые вопросы".

Спикер: Юрий Калашников

В этом материале подводятся итоги курса по "Зелёному офису" и даются ответы на часто задаваемые вопросы:
- Ключевые выводы и рекомендации курса
- Ответы на популярные вопросы участников
- Типичные ошибки и как их избежать
- Дополнительные ресурсы и материалы
- Следующие шаги для развития

Материал поможет закрепить полученные знания и найти ответы на практические вопросы по внедрению концепции "Зелёный офис".',
  ARRAY['https://vkvideo.ru/video-172285001_456239296'],
  NOW()
);

-- Статья 21: Курс «Университет волонтёра» — Развитие городов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «Университет волонтёра» — Развитие городов',
  'Видео-лекция из курса «Университет волонтёра» на тему "Развитие городов".

Спикер: Ольга Вовк

В этом материале рассматриваются вопросы развития городов через волонтёрскую деятельность:
- Роль волонтёров в развитии городской среды
- Социальные проекты для развития городов
- Взаимодействие с городскими властями и сообществами
- Устойчивое развитие городской среды
- Лучшие практики городских волонтёрских инициатив

Материал поможет волонтёрам и НКО понять, как их деятельность может способствовать развитию городов.',
  ARRAY['https://vkvideo.ru/video-172285001_456239282'],
  NOW()
);

-- Статья 22: Нормы социального проектирования проектов и лучшая практика КСО-проектов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Нормы социального проектирования проектов и лучшая практика КСО-проектов',
  'Видео-лекция на тему "Нормы социального проектирования проектов и лучшая практика КСО-проектов".

Спикер: Алексей Журавлев

В этом материале рассматриваются стандарты и практики социального проектирования:
- Нормы и стандарты социального проектирования
- Лучшие практики корпоративной социальной ответственности (КСО)
- Проектирование социально значимых проектов
- Методологии и подходы к социальному проектированию
- Кейсы успешных КСО-проектов

Материал поможет организациям создавать эффективные социальные проекты в соответствии с лучшими практиками.',
  ARRAY['https://vkvideo.ru/video-172285001_456239281'],
  NOW()
);

-- Статья 23: Оценка эффективности КСО-проектов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Оценка эффективности КСО-проектов',
  'Видео-лекция на тему "Оценка эффективности КСО-проектов".

Спикер: Жак Загидуллин

В этом материале рассматриваются методы оценки эффективности корпоративных социальных проектов:
- Методологии оценки эффективности КСО-проектов
- Ключевые показатели эффективности (KPI)
- Измерение социального воздействия
- Оценка экономической эффективности
- Отчетность и коммуникация результатов

Материал поможет организациям правильно оценивать эффективность своих социальных проектов и демонстрировать их ценность.',
  ARRAY['https://vkvideo.ru/video-172285001_456239280'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Основные задачи PR%'),
  'PR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Основные задачи PR%'),
  'Коммуникации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Организация мероприятий и их PR-поддержка%'),
  'PR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Организация мероприятий и их PR-поддержка%'),
  'Мероприятия'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Взаимосвязь PR и GR%'),
  'PR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Взаимосвязь PR и GR%'),
  'GR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Взаимосвязь PR и GR%'),
  'Брендинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Команда НКО: От набора людей%'),
  'Управление командой'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Команда НКО: От набора людей%'),
  'HR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Управление командой: Инструменты руководителя%'),
  'Управление командой'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Управление командой: Инструменты руководителя%'),
  'Лидерство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Развитие и удержание команды%'),
  'Управление командой'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Развитие и удержание команды%'),
  'HR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Концепция «Зелёный офис». С чего начать?%'),
  'Зелёный офис'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Концепция «Зелёный офис». С чего начать?%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зелёный офис: от слов к делу%'),
  'Зелёный офис'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зелёный офис: от слов к делу%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как привлекать и вовлекать сотрудников%'),
  'Зелёный офис'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как привлекать и вовлекать сотрудников%'),
  'Вовлечение сотрудников'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Путь от возникновения идеи%'),
  'Зелёный офис'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Путь от возникновения идеи%'),
  'Управление проектами'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Вовлечение сотрудников в концепцию%'),
  'Зелёный офис'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Вовлечение сотрудников в концепцию%'),
  'Вовлечение сотрудников'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Подведение итогов курса%'),
  'Зелёный офис'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Развитие городов%'),
  'Университет волонтёра'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Развитие городов%'),
  'Развитие территорий'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Нормы социального проектирования%'),
  'КСО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Нормы социального проектирования%'),
  'Социальное проектирование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка эффективности КСО-проектов%'),
  'КСО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка эффективности КСО-проектов%'),
  'Оценка эффективности'
);

-- Статья 24: Как создать своё сообщество
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как создать своё сообщество',
  'Видео-лекция на тему "Как создать своё сообщество".

Спикеры: Юрий Калашников, Ася Репрева

В этом материале рассматриваются практические аспекты создания сообщества:
- Основы создания сообщества вокруг проекта или идеи
- Построение структуры и правил сообщества
- Привлечение первых участников
- Создание ценности для участников сообщества
- Развитие и масштабирование сообщества

Материал поможет создать активное и вовлеченное сообщество единомышленников.',
  ARRAY['https://vkvideo.ru/video-172285001_456239279?t=20m28s'],
  NOW()
);

-- Статья 25: Как собрать вокруг себя единомышленников и расширить целевую аудиторию
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как собрать вокруг себя единомышленников и расширить целевую аудиторию',
  'Видео-лекция на тему "Как собрать вокруг себя единомышленников и расширить целевую аудиторию".

Спикер: Ася Репрева

В этом материале рассматриваются стратегии привлечения единомышленников и расширения аудитории:
- Методы поиска и привлечения единомышленников
- Расширение целевой аудитории проекта
- Коммуникационные стратегии для привлечения новых участников
- Работа с существующей аудиторией для привлечения новых
- Инструменты и платформы для расширения сообщества

Материал поможет эффективно расширять аудиторию и находить единомышленников для своего проекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239278?t=42m16s'],
  NOW()
);

-- Статья 26: Социальные экостартапы: может ли волонтерский проект стать бизнес-проектом
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Социальные экостартапы: может ли волонтерский проект стать бизнес-проектом',
  'Видео-лекция на тему "Социальные экостартапы: может ли волонтерский проект стать бизнес-проектом".

Спикер: Сергей Тушев

В этом материале рассматриваются возможности трансформации волонтерских проектов в бизнес:
- Переход от волонтерского проекта к социальному бизнесу
- Особенности социальных экостартапов
- Бизнес-модели для социальных проектов
- Монетизация экологических инициатив
- Преодоление барьеров при трансформации проекта

Материал поможет понять, как волонтерский проект может стать устойчивым бизнес-проектом.',
  ARRAY['https://vkvideo.ru/video-172285001_456239277'],
  NOW()
);

-- Статья 27: Грантрайтинг - секреты подготовки успешной заявки
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Грантрайтинг - секреты подготовки успешной заявки',
  'Видео-лекция на тему "Грантрайтинг - секреты подготовки успешной заявки".

Спикер: Эльвира Алейниченко

В этом материале рассматриваются секреты успешного грантрайтинга:
- Структура и компоненты успешной грантовой заявки
- Секреты написания убедительных заявок
- Как выделиться среди конкурентов
- Типичные ошибки и как их избежать
- Работа с бюджетом и обоснованием расходов

Материал поможет повысить шансы на получение грантового финансирования через качественную подготовку заявки.',
  ARRAY['https://vkvideo.ru/video-172285001_456239276'],
  NOW()
);

-- Статья 28: Разбор грантовых конкурсов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Разбор грантовых конкурсов',
  'Видео-лекция на тему "Разбор грантовых конкурсов".

Спикер: Эльвира Алейниченко

В этом материале рассматривается анализ и разбор грантовых конкурсов:
- Как анализировать условия грантовых конкурсов
- Выбор подходящих конкурсов для участия
- Понимание требований и критериев оценки
- Стратегия участия в конкурсах
- Разбор примеров успешных заявок

Материал поможет правильно выбирать и анализировать грантовые конкурсы для максимальной эффективности участия.',
  ARRAY['https://vkvideo.ru/video-172285001_456239275'],
  NOW()
);

-- Статья 29: Подготовка к питчингу
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Подготовка к питчингу',
  'Видео-лекция на тему "Подготовка к питчингу".

Спикер: Игорь Померанцев

В этом материале рассматриваются аспекты подготовки к питчингу проекта:
- Что такое питчинг и его цели
- Структура успешной презентации проекта
- Подготовка выступления и репетиция
- Работа с аудиторией и ответы на вопросы
- Типичные ошибки при питчинге и как их избежать

Материал поможет эффективно подготовиться к презентации проекта перед инвесторами, донорами или жюри конкурса.',
  ARRAY['https://vkvideo.ru/video-172285001_456239274'],
  NOW()
);

-- Статья 30: «Школа социального проектирования» — Какие тренды социального проектирования актуальны?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  '«Школа социального проектирования» — Какие тренды социального проектирования актуальны?',
  'Видео-лекция из «Школы социального проектирования» на тему "Какие тренды социального проектирования актуальны?".

Спикер: Евгения Николаева

В этом материале рассматриваются актуальные тренды в социальном проектировании:
- Современные тренды социального проектирования
- Новые подходы и методологии
- Инновации в социальной сфере
- Адаптация проектов под современные вызовы
- Будущее социального проектирования

Материал поможет быть в курсе актуальных трендов и применять их в своих проектах.',
  ARRAY['https://vkvideo.ru/video-172285001_456239271'],
  NOW()
);

-- Статья 31: Практика: ищем идеи проекта
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Практика: ищем идеи проекта',
  'Видео-лекция на тему "Практика: ищем идеи проекта".

Спикер: Евгения Николаева

В этом материале рассматриваются практические методы поиска идей для социальных проектов:
- Методы генерации идей для проектов
- Анализ потребностей целевой аудитории
- Выявление социальных проблем и их решений
- Техники креативного мышления
- От идеи к концепции проекта

Материал поможет найти вдохновение и сформировать идею для социального проекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239270'],
  NOW()
);

-- Статья 32: Как собрать команду мечты?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как собрать команду мечты?',
  'Видео-лекция на тему "Как собрать команду мечты?".

Спикер: Ани Кочарян

В этом материале рассматриваются стратегии формирования идеальной команды:
- Поиск и подбор подходящих людей
- Определение ролей и компетенций в команде
- Создание синергии в команде
- Мотивация и удержание талантов
- Построение эффективных рабочих отношений

Материал поможет собрать команду, которая будет эффективно работать над достижением целей проекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239269'],
  NOW()
);

-- Статья 33: Как выстраивать отношения с ЦА в социальных сетях?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как выстраивать отношения с ЦА в социальных сетях?',
  'Видео-лекция на тему "Как выстраивать отношения с ЦА в социальных сетях?".

Спикер: Шанаева Ирина

В этом материале рассматриваются стратегии построения отношений с целевой аудиторией в социальных сетях:
- Понимание целевой аудитории в соцсетях
- Стратегии взаимодействия с аудиторией
- Создание доверия и лояльности
- Работа с комментариями и обратной связью
- Построение долгосрочных отношений

Материал поможет эффективно выстраивать отношения с целевой аудиторией через социальные сети.',
  ARRAY['https://vkvideo.ru/video-172285001_456239268'],
  NOW()
);

-- Статья 34: Как вести социальные сети вашего проекта?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как вести социальные сети вашего проекта?',
  'Видео-лекция на тему "Как вести социальные сети вашего проекта?".

Спикер: Шанаева Ирина

В этом материале рассматриваются практические аспекты ведения социальных сетей проекта:
- Стратегия контента для социальных сетей
- Планирование публикаций и контент-план
- Создание визуального контента
- Аналитика и измерение эффективности
- Инструменты для управления социальными сетями

Материал поможет эффективно вести социальные сети проекта и привлекать внимание целевой аудитории.',
  ARRAY['https://vkvideo.ru/video-172285001_456239267'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как создать своё сообщество%'),
  'Сообщества'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как создать своё сообщество%'),
  'Коммуникации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как собрать вокруг себя единомышленников%'),
  'Сообщества'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как собрать вокруг себя единомышленников%'),
  'Целевая аудитория'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Социальные экостартапы%'),
  'Социальное предпринимательство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Социальные экостартапы%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Грантрайтинг - секреты подготовки%'),
  'Гранты'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Грантрайтинг - секреты подготовки%'),
  'Проектные заявки'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Разбор грантовых конкурсов%'),
  'Гранты'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Разбор грантовых конкурсов%'),
  'Проектные заявки'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Подготовка к питчингу%'),
  'Презентации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Подготовка к питчингу%'),
  'Фандрайзинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Какие тренды социального проектирования%'),
  'Школа социального проектирования'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Какие тренды социального проектирования%'),
  'Социальное проектирование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практика: ищем идеи проекта%'),
  'Школа социального проектирования'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практика: ищем идеи проекта%'),
  'Генерация идей'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как собрать команду мечты%'),
  'Управление командой'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как собрать команду мечты%'),
  'HR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как выстраивать отношения с ЦА в социальных сетях%'),
  'Социальные сети'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как выстраивать отношения с ЦА в социальных сетях%'),
  'Целевая аудитория'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как вести социальные сети вашего проекта%'),
  'Социальные сети'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как вести социальные сети вашего проекта%'),
  'SMM'
);

-- Статья 35: Написание заявки на грант: инструкция по применению
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Написание заявки на грант: инструкция по применению',
  'Видео-лекция на тему "Написание заявки на грант: инструкция по применению".

Спикер: Алексей Арбузов

В этом материале рассматривается пошаговая инструкция по написанию грантовой заявки:
- Структура грантовой заявки
- Пошаговое руководство по заполнению заявки
- Ключевые разделы и их содержание
- Типичные ошибки и как их избежать
- Практические советы и рекомендации

Материал поможет систематически подойти к написанию грантовой заявки и повысить шансы на успех.',
  ARRAY['https://vkvideo.ru/video-172285001_456239266'],
  NOW()
);

-- Статья 36: Обзор грантовых конкурсов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Обзор грантовых конкурсов',
  'Видео-лекция на тему "Обзор грантовых конкурсов".

Спикер: Алексей Арбузов

В этом материале представлен обзор различных грантовых конкурсов:
- Основные грантовые конкурсы в России
- Критерии и требования конкурсов
- Сроки подачи заявок
- Размеры финансирования
- Стратегия выбора подходящих конкурсов

Материал поможет сориентироваться в многообразии грантовых конкурсов и выбрать наиболее подходящие для своего проекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239265'],
  NOW()
);

-- Статья 37: Где найти финансирование проекта?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Где найти финансирование проекта?',
  'Видео-лекция на тему "Где найти финансирование проекта?".

Спикер: Дарья Буянова

В этом материале рассматриваются различные источники финансирования проектов:
- Гранты и конкурсы
- Краудфандинг
- Спонсорство и партнерства
- Государственная поддержка
- Частные фонды и доноры
- Социальные инвестиции

Материал поможет найти подходящие источники финансирования для реализации проекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239264'],
  NOW()
);

-- Статья 38: В чём секрет успешного проектного менеджера?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'В чём секрет успешного проектного менеджера?',
  'Видео-лекция на тему "В чём секрет успешного проектного менеджера?".

Спикер: Алексей Мокеев

В этом материале раскрываются секреты успешного управления проектами:
- Ключевые компетенции проектного менеджера
- Навыки и качества успешного менеджера
- Методы и инструменты управления проектами
- Работа с командой и стейкхолдерами
- Преодоление типичных проблем в проектах

Материал поможет развить навыки управления проектами и стать более эффективным проектным менеджером.',
  ARRAY['https://vkvideo.ru/video-172285001_456239263?t=2s'],
  NOW()
);

-- Статья 39: Курс «Академия социальных лидеров» — Основы социального бизнеса
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс «Академия социальных лидеров» — Основы социального бизнеса',
  'Видео-лекция из курса «Академия социальных лидеров» на тему "Основы социального бизнеса".

Спикер: Валерия Завгородняя

В этом материале рассматриваются основы социального бизнеса:
- Понятие и принципы социального бизнеса
- Отличия социального бизнеса от традиционного
- Бизнес-модели в социальном предпринимательстве
- Баланс социальной миссии и экономической эффективности
- Примеры успешных социальных бизнесов

Материал поможет понять основы социального бизнеса и начать свой путь в социальном предпринимательстве.',
  ARRAY['https://vkvideo.ru/video-172285001_456239262'],
  NOW()
);

-- Статья 40: Ценностное предложение
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Ценностное предложение',
  'Видео-лекция на тему "Ценностное предложение".

Спикеры: Юрий Калашников, Алексей Назаров

В этом материале рассматривается создание ценностного предложения:
- Понятие ценностного предложения
- Как сформулировать уникальное ценностное предложение
- Анализ потребностей целевой аудитории
- Позиционирование продукта или услуги
- Коммуникация ценностного предложения

Материал поможет создать убедительное ценностное предложение, которое выделит ваш проект среди конкурентов.',
  ARRAY['https://vkvideo.ru/video-172285001_456239261'],
  NOW()
);

-- Статья 41: Краш-тест бизнес-идей: каналы коммуникации и модели сбыта
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Краш-тест бизнес-идей: каналы коммуникации и модели сбыта',
  'Видео-лекция на тему "Краш-тест бизнес-идей: каналы коммуникации и модели сбыта".

Спикер: Юрий Калашников

В этом материале рассматривается тестирование бизнес-идей через анализ каналов коммуникации и моделей сбыта:
- Методы краш-тестирования бизнес-идей
- Выбор и оценка каналов коммуникации
- Разработка моделей сбыта
- Тестирование гипотез
- Валидация бизнес-модели

Материал поможет протестировать бизнес-идею и выбрать оптимальные каналы коммуникации и модели сбыта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239260'],
  NOW()
);

-- Статья 42: Социальное предпринимательство. Бизнес-модель и поиск ресурсов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Социальное предпринимательство. Бизнес-модель и поиск ресурсов',
  'Видео-лекция на тему "Социальное предпринимательство. Бизнес-модель и поиск ресурсов".

Спикеры: Анастасия Москвитина, Маша Грекова

В этом материале рассматриваются бизнес-модели в социальном предпринимательстве и поиск ресурсов:
- Разработка бизнес-модели для социального предприятия
- Поиск и привлечение ресурсов
- Финансовое планирование социального бизнеса
- Устойчивость бизнес-модели
- Источники финансирования и инвестиций

Материал поможет построить устойчивую бизнес-модель и найти необходимые ресурсы для развития социального предприятия.',
  ARRAY['https://vkvideo.ru/video-172285001_456239259'],
  NOW()
);

-- Статья 43: Государственная поддержка социального предпринимательства
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Государственная поддержка социального предпринимательства',
  'Видео-лекция на тему "Государственная поддержка социального предпринимательства".

Спикер: Олеся Гимранова

В этом материале рассматриваются меры государственной поддержки социального предпринимательства:
- Программы государственной поддержки
- Субсидии и льготы для социальных предпринимателей
- Инфраструктура поддержки
- Как получить государственную поддержку
- Региональные программы поддержки

Материал поможет узнать о доступных мерах государственной поддержки и как их получить.',
  ARRAY['https://vkvideo.ru/video-172285001_456239258'],
  NOW()
);

-- Статья 44: Личный бренд новой реальности
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Личный бренд новой реальности',
  'Видео-лекция на тему "Личный бренд новой реальности".

Спикер: Ольга Шаратута

В этом материале рассматривается построение личного бренда в современных условиях:
- Понятие личного бренда
- Стратегия построения личного бренда
- Цифровые инструменты для личного брендинга
- Адаптация к новой реальности
- Позиционирование и коммуникация

Материал поможет построить сильный личный бренд, который будет актуален в современном мире.',
  ARRAY['https://vkvideo.ru/video-172285001_456239257'],
  NOW()
);

-- Статья 45: Личная стратегия в управлении персоналом
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Личная стратегия в управлении персоналом',
  'Видео-лекция на тему "Личная стратегия в управлении персоналом".

Спикер: Андрей Константинов

В этом материале рассматривается разработка личной стратегии в управлении персоналом:
- Разработка личной стратегии руководителя
- Стили управления и их применение
- Построение отношений с командой
- Развитие лидерских качеств
- Эффективное управление персоналом

Материал поможет разработать собственную стратегию управления персоналом и стать более эффективным руководителем.',
  ARRAY['https://vkvideo.ru/video-172285001_456239256'],
  NOW()
);

-- Статья 46: Организационная модель как операционная система предприятия
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Организационная модель как операционная система предприятия',
  'Видео-лекция на тему "Организационная модель как операционная система предприятия".

Спикер: Юрий Калашников

В этом материале рассматривается организационная модель как основа функционирования предприятия:
- Понятие организационной модели
- Построение эффективной организационной структуры
- Процессы и системы в организации
- Оптимизация организационной модели
- Масштабирование организационной модели

Материал поможет построить эффективную организационную модель, которая будет работать как операционная система предприятия.',
  ARRAY['https://vkvideo.ru/video-172285001_456239255?t=2s'],
  NOW()
);

-- Статья 47: Секреты построения успешного бизнеса
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Секреты построения успешного бизнеса',
  'Видео-лекция на тему "Секреты построения успешного бизнеса".

Спикер: Елена Рендаревская

В этом материале раскрываются секреты построения успешного бизнеса:
- Ключевые факторы успеха бизнеса
- Стратегия развития бизнеса
- Управление рисками
- Построение устойчивой бизнес-модели
- Масштабирование бизнеса

Материал поможет понять секреты успешного бизнеса и применить их в своей деятельности.',
  ARRAY['https://vkvideo.ru/video-172285001_456239254'],
  NOW()
);

-- Статья 48: Оценка социального воздействия и эффективности
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Оценка социального воздействия и эффективности',
  'Видео-лекция на тему "Оценка социального воздействия и эффективности".

Спикер: Инна Газиева

В этом материале рассматриваются методы оценки социального воздействия и эффективности:
- Методологии оценки социального воздействия
- Измерение эффективности социальных проектов
- Ключевые показатели эффективности (KPI)
- Инструменты оценки и анализа
- Отчетность о социальном воздействии

Материал поможет правильно оценивать социальное воздействие и эффективность проектов и демонстрировать их ценность.',
  ARRAY['https://vkvideo.ru/video-172285001_456239253'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Написание заявки на грант: инструкция%'),
  'Гранты'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Написание заявки на грант: инструкция%'),
  'Проектные заявки'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Обзор грантовых конкурсов%'),
  'Гранты'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Где найти финансирование проекта%'),
  'Фандрайзинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Где найти финансирование проекта%'),
  'Финансирование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%В чём секрет успешного проектного менеджера%'),
  'Управление проектами'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%В чём секрет успешного проектного менеджера%'),
  'Проектный менеджмент'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Основы социального бизнеса%'),
  'Академия социальных лидеров'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Основы социального бизнеса%'),
  'Социальное предпринимательство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Ценностное предложение%'),
  'Маркетинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Ценностное предложение%'),
  'Позиционирование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Краш-тест бизнес-идей%'),
  'Бизнес-модели'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Краш-тест бизнес-идей%'),
  'Валидация'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Социальное предпринимательство. Бизнес-модель%'),
  'Социальное предпринимательство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Социальное предпринимательство. Бизнес-модель%'),
  'Бизнес-модели'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Государственная поддержка социального предпринимательства%'),
  'Социальное предпринимательство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Государственная поддержка социального предпринимательства%'),
  'Государственная поддержка'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Личный бренд новой реальности%'),
  'Личный бренд'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Личный бренд новой реальности%'),
  'Брендинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Личная стратегия в управлении персоналом%'),
  'Управление персоналом'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Личная стратегия в управлении персоналом%'),
  'HR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Организационная модель как операционная система%'),
  'Организационное развитие'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Организационная модель как операционная система%'),
  'Управление'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Секреты построения успешного бизнеса%'),
  'Бизнес'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Секреты построения успешного бизнеса%'),
  'Предпринимательство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка социального воздействия и эффективности%'),
  'Оценка эффективности'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка социального воздействия и эффективности%'),
  'Социальный импакт'
);

-- Статья 49: КСО-проекты как инструмент усиления влияния в регионе — Корпоративная стратегия Росатома
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'КСО-проекты как инструмент усиления влияния в регионе — Корпоративная стратегия Росатома. Определение целей, задач и особенностей стратегии Росатома в сфере КСО',
  'Видео-лекция на тему "КСО-проекты как инструмент усиления влияния в регионе — Корпоративная стратегия Росатома. Определение целей, задач и особенностей стратегии Росатома в сфере КСО".

Спикеры: Юрий Калашников, Юлия Бронникова, Ольга Шкабардня

В этом материале рассматривается корпоративная стратегия Росатома в сфере КСО:
- КСО-проекты как инструмент регионального влияния
- Определение целей и задач КСО-стратегии
- Особенности стратегии Росатома в сфере КСО
- Региональное развитие через КСО-проекты
- Интеграция КСО в корпоративную стратегию

Материал поможет понять, как КСО-проекты могут стать инструментом усиления влияния в регионе и как выстраивать стратегию КСО.',
  ARRAY['https://vkvideo.ru/video-172285001_456239252'],
  NOW()
);

-- Статья 50: КСО-проекты как инструмент усиления влияния в регионе
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'КСО-проекты как инструмент усиления влияния в регионе',
  'Видео-лекция на тему "КСО-проекты как инструмент усиления влияния в регионе".

Спикер: Юрий Калашников

В этом материале рассматривается использование КСО-проектов для усиления регионального влияния:
- Роль КСО-проектов в региональном развитии
- Стратегическое использование КСО для влияния
- Построение отношений с региональными стейкхолдерами
- Измерение влияния КСО-проектов
- Интеграция КСО в региональную стратегию

Материал поможет использовать КСО-проекты как эффективный инструмент усиления влияния в регионе.',
  ARRAY['https://vkvideo.ru/video-172285001_456239251'],
  NOW()
);

-- Статья 51: Коммуникации в КСО проектах
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Коммуникации в КСО проектах',
  'Видео-лекция на тему "Коммуникации в КСО проектах".

Спикер: Шанаева Ирина

В этом материале рассматриваются коммуникационные стратегии в КСО-проектах:
- Стратегия коммуникаций для КСО-проектов
- Работа с различными аудиториями
- Каналы коммуникации в КСО
- Позиционирование КСО-проектов
- Измерение эффективности коммуникаций

Материал поможет выстроить эффективные коммуникации для КСО-проектов и донести их ценность до целевых аудиторий.',
  ARRAY['https://vkvideo.ru/video-172285001_456239250'],
  NOW()
);

-- Статья 52: Оценка эффективности социальных инвестиций
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Оценка эффективности социальных инвестиций',
  'Видео-лекция на тему "Оценка эффективности социальных инвестиций".

Спикеры: Юрий Калашников, Ирина Архипова

В этом материале рассматриваются методы оценки эффективности социальных инвестиций:
- Методологии оценки социальных инвестиций
- Ключевые показатели эффективности
- Измерение социального возврата на инвестиции (SROI)
- Оценка долгосрочного воздействия
- Отчетность о результатах социальных инвестиций

Материал поможет правильно оценивать эффективность социальных инвестиций и демонстрировать их ценность.',
  ARRAY['https://vkvideo.ru/video-172285001_456239249'],
  NOW()
);

-- Статья 53: Креативная сессия «Матрица гениальных идей»
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Креативная сессия «Матрица гениальных идей»',
  'Практическое занятие "Креативная сессия «Матрица гениальных идей»".

Спикер: Юрий Калашников

В этом материале представлена креативная сессия по генерации идей:
- Метод "Матрица гениальных идей"
- Техники креативного мышления
- Генерация инновационных решений
- Структурированный подход к поиску идей
- Практическое применение метода

Материал поможет освоить эффективный метод генерации креативных идей для проектов.',
  ARRAY['https://vkvideo.ru/video-172285001_456239248'],
  NOW()
);

-- Статья 54: Практическое занятие «Работа со стейкхолдерами» часть 1
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Практическое занятие «Работа со стейкхолдерами» часть 1',
  'Практическое занятие "Работа со стейкхолдерами" часть 1.

Спикер: Юрий Калашников

В этом материале рассматриваются основы работы со стейкхолдерами:
- Идентификация стейкхолдеров проекта
- Анализ интересов и влияния стейкхолдеров
- Построение карты стейкхолдеров
- Стратегии работы с различными группами стейкхолдеров
- Коммуникация со стейкхолдерами

Материал поможет освоить основы эффективной работы со стейкхолдерами проекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239247'],
  NOW()
);

-- Статья 55: Практическое занятие «Работа со стейкхолдерами» часть 2
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Практическое занятие «Работа со стейкхолдерами» часть 2',
  'Практическое занятие "Работа со стейкхолдерами" часть 2.

Спикер: Юрий Калашников

В этом материале продолжается изучение работы со стейкхолдерами:
- Углубленные техники работы со стейкхолдерами
- Управление конфликтами интересов
- Вовлечение стейкхолдеров в проект
- Построение долгосрочных отношений
- Практические кейсы и примеры

Материал поможет углубить знания и навыки работы со стейкхолдерами.',
  ARRAY['https://vkvideo.ru/video-172285001_456239246'],
  NOW()
);

-- Статья 56: Практический воркшоп «Коммуникативное продвижение проекта»
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Практический воркшоп «Коммуникативное продвижение проекта»',
  'Практический воркшоп "Коммуникативное продвижение проекта".

Спикер: Юрий Калашников

В этом материале рассматриваются практические аспекты коммуникативного продвижения проектов:
- Разработка коммуникационной стратегии проекта
- Выбор каналов и инструментов продвижения
- Создание контента для продвижения
- Работа с медиа и партнерами
- Измерение эффективности коммуникаций

Материал поможет разработать и реализовать эффективную коммуникационную стратегию для продвижения проекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239245'],
  NOW()
);

-- Статья 57: Оценка КСО-проектов
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Оценка КСО-проектов',
  'Видео-лекция на тему "Оценка КСО-проектов".

Спикер: Юрий Калашников

В этом материале рассматриваются методы оценки КСО-проектов:
- Методологии оценки КСО-проектов
- Ключевые показатели эффективности КСО
- Измерение социального и экономического воздействия
- Оценка достижения целей проекта
- Отчетность и коммуникация результатов

Материал поможет правильно оценивать эффективность КСО-проектов и демонстрировать их ценность.',
  ARRAY['https://vkvideo.ru/video-172285001_456239244'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Корпоративная стратегия Росатома%'),
  'КСО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Корпоративная стратегия Росатома%'),
  'Корпоративная стратегия'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%КСО-проекты как инструмент усиления влияния в регионе%' AND name NOT LIKE '%Корпоративная стратегия%'),
  'КСО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%КСО-проекты как инструмент усиления влияния в регионе%' AND name NOT LIKE '%Корпоративная стратегия%'),
  'Региональное развитие'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Коммуникации в КСО проектах%'),
  'КСО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Коммуникации в КСО проектах%'),
  'Коммуникации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка эффективности социальных инвестиций%'),
  'КСО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка эффективности социальных инвестиций%'),
  'Оценка эффективности'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Креативная сессия «Матрица гениальных идей»%'),
  'Генерация идей'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Креативная сессия «Матрица гениальных идей»%'),
  'Креативность'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практическое занятие «Работа со стейкхолдерами» часть 1%'),
  'Стейкхолдеры'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практическое занятие «Работа со стейкхолдерами» часть 1%'),
  'Управление проектами'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практическое занятие «Работа со стейкхолдерами» часть 2%'),
  'Стейкхолдеры'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практическое занятие «Работа со стейкхолдерами» часть 2%'),
  'Управление проектами'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практический воркшоп «Коммуникативное продвижение проекта»%'),
  'Коммуникации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Практический воркшоп «Коммуникативное продвижение проекта»%'),
  'Продвижение проектов'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка КСО-проектов%'),
  'КСО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка КСО-проектов%'),
  'Оценка эффективности'
);

-- Статья 58: Зелёный Драйвер — Направления развития малого и среднего экобизнеса
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Зелёный Драйвер — Направления развития малого и среднего экобизнеса',
  'Видео-лекция из курса "Зелёный Драйвер" на тему "Направления развития малого и среднего экобизнеса".

Спикер: Роман Саблин

В этом материале рассматриваются направления развития малого и среднего экобизнеса:
- Тренды и возможности в экобизнесе
- Направления развития для малого и среднего бизнеса
- Рыночные ниши в экосфере
- Стратегии развития экобизнеса
- Перспективы и вызовы экобизнеса

Материал поможет понять направления развития и возможности для малого и среднего экобизнеса.',
  ARRAY['https://vkvideo.ru/video-172285001_456239224'],
  NOW()
);

-- Статья 59: Разбор бизнес-моделей наиболее успешных экобизнесов и их узкие места
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Разбор бизнес-моделей наиболее успешных экобизнесов и их узкие места',
  'Видео-лекция на тему "Разбор бизнес-моделей наиболее успешных экобизнесов и их узкие места".

Спикеры: Роман Саблин, Тимофей Головин

В этом материале рассматриваются бизнес-модели успешных экобизнесов:
- Анализ успешных бизнес-моделей в экосфере
- Ключевые факторы успеха экобизнесов
- Узкие места и риски в бизнес-моделях
- Извлечение уроков из успешных кейсов
- Применение лучших практик

Материал поможет понять, какие бизнес-модели работают в экобизнесе и какие подводные камни нужно учитывать.',
  ARRAY['https://vkvideo.ru/video-172285001_456239228'],
  NOW()
);

-- Статья 60: Общие подходы к оценке рынка
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Общие подходы к оценке рынка',
  'Видео-лекция на тему "Общие подходы к оценке рынка".

Спикер: Тимофей Головин

В этом материале рассматриваются методы оценки рынка:
- Методологии оценки рынка
- Анализ целевой аудитории и конкурентов
- Оценка размера и потенциала рынка
- Исследование рыночных трендов
- Инструменты и техники анализа рынка

Материал поможет правильно оценить рынок для своего экопроекта или бизнеса.',
  ARRAY['https://vkvideo.ru/video-172285001_456239229'],
  NOW()
);

-- Статья 61: Принципы формирования финансовой модели и источники финансирования
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Принципы формирования финансовой модели и источники финансирования',
  'Видео-лекция на тему "Принципы формирования финансовой модели и источники финансирования".

Спикер: Тимофей Головин

В этом материале рассматриваются финансовые аспекты экобизнеса:
- Принципы построения финансовой модели
- Структура финансовой модели проекта
- Источники финансирования для экопроектов
- Планирование доходов и расходов
- Инвестиционные инструменты

Материал поможет построить финансовую модель и найти источники финансирования для экопроекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239230'],
  NOW()
);

-- Статья 62: Проектирование в концепции Устойчивого развития
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Проектирование в концепции Устойчивого развития',
  'Видео-лекция на тему "Проектирование в концепции Устойчивого развития".

Спикер: Роман Саблин

В этом материале рассматривается проектирование в контексте устойчивого развития:
- Концепция устойчивого развития (УР)
- Принципы проектирования в УР
- Интеграция экологических, социальных и экономических аспектов
- Методологии устойчивого проектирования
- Примеры проектов в концепции УР

Материал поможет проектировать проекты с учетом принципов устойчивого развития.',
  ARRAY['https://vkvideo.ru/video-172285001_456239231'],
  NOW()
);

-- Статья 63: Где найти финансирование для экопроекта?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Где найти финансирование для экопроекта?',
  'Видео-лекция на тему "Где найти финансирование для экопроекта?".

Спикер: Роман Саблин

В этом материале рассматриваются источники финансирования для экопроектов:
- Гранты и конкурсы для экопроектов
- Экологические фонды и программы
- Краудфандинг для экопроектов
- Инвестиции в экобизнес
- Государственная поддержка экопроектов

Материал поможет найти подходящие источники финансирования для реализации экопроекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239232'],
  NOW()
);

-- Статья 64: Оценка социального воздействия и экономической эффективности
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Оценка социального воздействия и экономической эффективности',
  'Видео-лекция на тему "Оценка социального воздействия и экономической эффективности".

Спикер: Роман Саблин

В этом материале рассматриваются методы оценки социального воздействия и экономической эффективности:
- Методологии оценки социального воздействия
- Измерение экономической эффективности
- Ключевые показатели эффективности (KPI)
- Интеграция социальных и экономических метрик
- Отчетность о результатах

Материал поможет правильно оценить социальное воздействие и экономическую эффективность экопроекта.',
  ARRAY['https://vkvideo.ru/video-172285001_456239233'],
  NOW()
);

-- Статья 65: Зелёный маркетинг: продвижение для малого и среднего экобизнеса
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Зелёный маркетинг: продвижение для малого и среднего экобизнеса',
  'Видео-лекция на тему "Зелёный маркетинг: продвижение для малого и среднего экобизнеса".

Спикер: Анна Лаврова

В этом материале рассматриваются стратегии маркетинга для экобизнеса:
- Принципы зелёного маркетинга
- Продвижение экопродуктов и услуг
- Работа с экосознательной аудиторией
- Коммуникация экологических преимуществ
- Инструменты и каналы продвижения

Материал поможет эффективно продвигать экобизнес с помощью зелёного маркетинга.',
  ARRAY['https://vkvideo.ru/video-172285001_456239234?t=1s'],
  NOW()
);

-- Статья 66: GR: выстраивание отношений экобизнеса с государством
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'GR: выстраивание отношений экобизнеса с государством',
  'Видео-лекция на тему "GR: выстраивание отношений экобизнеса с государством".

Спикеры: Роман Саблин, Дмитрий Селин

В этом материале рассматриваются вопросы взаимодействия экобизнеса с государством:
- Понятие GR (Government Relations) в экобизнесе
- Стратегии работы с государственными структурами
- Лоббирование интересов экобизнеса
- Участие в государственных программах
- Построение долгосрочных отношений

Материал поможет выстроить эффективные отношения с государством для развития экобизнеса.',
  ARRAY['https://vkvideo.ru/video-172285001_456239235'],
  NOW()
);

-- Статья 67: Как открыть ЭкоЦентр: мультиформатное пространство с приемом вторсырья, экопросвещением, музеем переработки и др.
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как открыть ЭкоЦентр: мультиформатное пространство с приемом вторсырья, экопросвещением, музеем переработки и др.',
  'Видео-лекция на тему "Как открыть ЭкоЦентр: мультиформатное пространство с приемом вторсырья, экопросвещением, музеем переработки и др.".

Спикер: Анна Лутай

В этом материале рассматривается практика создания ЭкоЦентра:
- Концепция мультиформатного ЭкоЦентра
- Организация приема вторсырья
- Экопросветительская деятельность
- Создание музея переработки
- Бизнес-модель ЭкоЦентра
- Практические шаги по открытию

Материал поможет понять, как создать и открыть успешный ЭкоЦентр.',
  ARRAY['https://vkvideo.ru/video-172285001_456239236'],
  NOW()
);

-- Статья 68: Как упаковать свой проект в социальных сетях?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как упаковать свой проект в социальных сетях?',
  'Видео-лекция на тему "Как упаковать свой проект в социальных сетях?".

Спикер: Всеволод Пуля

В этом материале рассматриваются методы продвижения проекта в социальных сетях:
- Стратегия упаковки проекта для соцсетей
- Создание визуального контента
- Позиционирование проекта
- Работа с аудиторией в соцсетях
- Инструменты и платформы для продвижения

Материал поможет эффективно упаковать и продвигать свой проект в социальных сетях.',
  ARRAY['https://vkvideo.ru/video-172285001_456239116'],
  NOW()
);

-- Статья 69: Погода сейчас: аномалия или норма?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Погода сейчас: аномалия или норма?',
  'Видео-лекция на тему "Погода сейчас: аномалия или норма?".

Спикер: Георгий Каваносян

В этом материале рассматриваются вопросы изменения климата и погодных аномалий:
- Анализ современных погодных явлений
- Изменение климата и его проявления
- Различие между аномалиями и нормой
- Научный подход к оценке климатических изменений
- Влияние на экосистемы и общество

Материал поможет понять природу современных климатических изменений и погодных явлений.',
  ARRAY['https://vkvideo.ru/video-172285001_456239117'],
  NOW()
);

-- Статья 70: Интеллектуальное волонтерство
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Интеллектуальное волонтерство',
  'Видео-лекция на тему "Интеллектуальное волонтерство".

Спикер: Владимир Хромов

В этом материале рассматривается концепция интеллектуального волонтерства:
- Понятие интеллектуального волонтерства
- Использование профессиональных навыков в волонтерстве
- Формы интеллектуального волонтерства
- Организация интеллектуального волонтерства
- Взаимная выгода для волонтеров и организаций

Материал поможет понять, как использовать профессиональные навыки в волонтерской деятельности.',
  ARRAY['https://vkvideo.ru/video-172285001_456239118'],
  NOW()
);

-- Статья 71: ЦУР: что могу сделать я?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'ЦУР: что могу сделать я?',
  'Видео-лекция на тему "ЦУР: что могу сделать я?".

Спикер: Евгения Кузнецова

В этом материале рассматриваются Цели устойчивого развития (ЦУР) и личный вклад:
- Понятие Целей устойчивого развития (ЦУР)
- Как каждый может внести вклад в достижение ЦУР
- Личные действия для устойчивого развития
- Интеграция ЦУР в повседневную жизнь
- Примеры практических действий

Материал поможет понять, как лично можно способствовать достижению Целей устойчивого развития.',
  ARRAY['https://vkvideo.ru/video-172285001_456239120'],
  NOW()
);

-- Статья 72: Как найти идею социального проекта с помощью ЦУР?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как найти идею социального проекта с помощью ЦУР?',
  'Видео-лекция на тему "Как найти идею социального проекта с помощью ЦУР?".

Спикер: Евгения Кузнецова

В этом материале рассматривается использование ЦУР для генерации идей проектов:
- ЦУР как источник идей для проектов
- Методы поиска идей через призму ЦУР
- Связь между ЦУР и социальными проектами
- Разработка проектов на основе ЦУР
- Примеры проектов, связанных с ЦУР

Материал поможет найти идею для социального проекта, используя Цели устойчивого развития.',
  ARRAY['https://vkvideo.ru/video-172285001_456239121'],
  NOW()
);

-- Статья 73: Успех социального бизнеса
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Успех социального бизнеса',
  'Видео-лекция на тему "Успех социального бизнеса".

Спикер: Мария Грекова

В этом материале рассматриваются факторы успеха социального бизнеса:
- Ключевые факторы успеха социального бизнеса
- Построение устойчивой бизнес-модели
- Баланс социальной миссии и экономической эффективности
- Стратегии развития социального бизнеса
- Примеры успешных социальных бизнесов

Материал поможет понять, что необходимо для успеха социального бизнеса.',
  ARRAY['https://vkvideo.ru/video-172285001_456239122'],
  NOW()
);

-- Статья 74: Как распознать гринвошинг и экомаркировки?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как распознать гринвошинг и экомаркировки?',
  'Видео-лекция на тему "Как распознать гринвошинг и экомаркировки?".

Спикер: Елена Володина

В этом материале рассматриваются вопросы гринвошинга и экомаркировок:
- Понятие гринвошинга (greenwashing)
- Как распознать гринвошинг
- Системы экомаркировок и их значение
- Надежные экологические сертификаты
- Критерии оценки экологичности продуктов

Материал поможет научиться распознавать гринвошинг и понимать значение экомаркировок.',
  ARRAY['https://vkvideo.ru/video-172285001_456239123'],
  NOW()
);

-- Статья 75: Вопиющие примеры гринвошинга
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Вопиющие примеры гринвошинга',
  'Видео-лекция на тему "Вопиющие примеры гринвошинга".

Спикер: Елена Володина

В этом материале рассматриваются примеры гринвошинга:
- Известные случаи гринвошинга
- Анализ примеров вводящей в заблуждение экологической рекламы
- Последствия гринвошинга для потребителей и экологии
- Как избежать обмана
- Уроки из примеров гринвошинга

Материал поможет научиться распознавать гринвошинг на реальных примерах.',
  ARRAY['https://vkvideo.ru/video-172285001_456239124'],
  NOW()
);

-- Статья 76: Гранты: как они выигрываются
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Гранты: как они выигрываются',
  'Видео-лекция на тему "Гранты: как они выигрываются".

Спикер: Егор Рафиков

В этом материале рассматриваются секреты успешного получения грантов:
- Стратегии выигрыша грантов
- Ключевые факторы успешных заявок
- Типичные ошибки и как их избежать
- Работа с грантодателями
- Практические советы от эксперта

Материал поможет повысить шансы на получение гранта через понимание механизмов выигрыша.',
  ARRAY['https://vkvideo.ru/video-172285001_456239125'],
  NOW()
);

-- Статья 77: Вредные советы про здоровый образ жизни
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Вредные советы про здоровый образ жизни',
  'Видео-лекция на тему "Вредные советы про здоровый образ жизни".

Спикер: Дмитрий Алексеев

В этом материале рассматриваются мифы и заблуждения о здоровом образе жизни:
- Распространенные мифы о ЗОЖ
- Вредные советы и их последствия
- Научный подход к здоровому образу жизни
- Развенчание популярных заблуждений
- Рекомендации по здоровому образу жизни

Материал поможет разобраться в мифах о здоровом образе жизни и получить достоверную информацию.',
  ARRAY['https://vkvideo.ru/video-172285001_456239126'],
  NOW()
);

-- Статья 78: Топ-5 профессий будущего в сфере устойчивого развития
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Топ-5 профессий будущего в сфере устойчивого развития',
  'Видео-лекция на тему "Топ-5 профессий будущего в сфере устойчивого развития".

Спикер: Александра Лавренко

В этом материале рассматриваются перспективные профессии в сфере устойчивого развития:
- Обзор профессий будущего в УР
- Требования и навыки для этих профессий
- Карьерные возможности
- Тренды развития профессий
- Как подготовиться к профессиям будущего

Материал поможет понять, какие профессии будут востребованы в сфере устойчивого развития.',
  ARRAY['https://vkvideo.ru/video-172285001_456239127'],
  NOW()
);

-- Статья 79: Устойчивая мода и что такое свопы
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Устойчивая мода и что такое свопы',
  'Видео-лекция на тему "Устойчивая мода и что такое свопы".

Спикер: Анастасия Акулинушкина

В этом материале рассматриваются вопросы устойчивой моды:
- Понятие устойчивой моды
- Что такое свопы (обмен одеждой)
- Преимущества устойчивой моды
- Организация свопов
- Тренды в устойчивой моде

Материал поможет понять концепцию устойчивой моды и практику свопов.',
  ARRAY['https://vkvideo.ru/video-172285001_456239128'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зелёный Драйвер%'),
  'Зелёный Драйвер'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зелёный Драйвер%'),
  'Экобизнес'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Разбор бизнес-моделей наиболее успешных экобизнесов%'),
  'Экобизнес'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Разбор бизнес-моделей наиболее успешных экобизнесов%'),
  'Бизнес-модели'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Общие подходы к оценке рынка%'),
  'Анализ рынка'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Принципы формирования финансовой модели%'),
  'Финансовая модель'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Принципы формирования финансовой модели%'),
  'Финансирование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Проектирование в концепции Устойчивого развития%'),
  'Устойчивое развитие'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Где найти финансирование для экопроекта%'),
  'Финансирование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Где найти финансирование для экопроекта%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка социального воздействия и экономической эффективности%' AND name NOT LIKE '%КСО%'),
  'Оценка эффективности'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Оценка социального воздействия и экономической эффективности%' AND name NOT LIKE '%КСО%'),
  'Социальный импакт'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зелёный маркетинг%'),
  'Маркетинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Зелёный маркетинг%'),
  'Экобизнес'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%GR: выстраивание отношений экобизнеса%'),
  'GR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%GR: выстраивание отношений экобизнеса%'),
  'Экобизнес'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как открыть ЭкоЦентр%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как открыть ЭкоЦентр%'),
  'Бизнес-модели'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как упаковать свой проект в социальных сетях%'),
  'Социальные сети'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как упаковать свой проект в социальных сетях%'),
  'SMM'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Погода сейчас: аномалия или норма%'),
  'Климат'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Погода сейчас: аномалия или норма%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Интеллектуальное волонтерство%'),
  'Волонтерство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%ЦУР: что могу сделать я%'),
  'ЦУР'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%ЦУР: что могу сделать я%'),
  'Устойчивое развитие'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как найти идею социального проекта с помощью ЦУР%'),
  'ЦУР'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как найти идею социального проекта с помощью ЦУР%'),
  'Генерация идей'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Успех социального бизнеса%'),
  'Социальное предпринимательство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как распознать гринвошинг%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как распознать гринвошинг%'),
  'Гринвошинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Вопиющие примеры гринвошинга%'),
  'Гринвошинг'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Гранты: как они выигрываются%'),
  'Гранты'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Вредные советы про здоровый образ жизни%'),
  'Здоровье'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Топ-5 профессий будущего%'),
  'Устойчивое развитие'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Топ-5 профессий будущего%'),
  'Карьера'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Устойчивая мода и что такое свопы%'),
  'Устойчивое развитие'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Устойчивая мода и что такое свопы%'),
  'Мода'
);

-- Статья 80: Полезное – вместе — Открытие марафона. Приветственное слово
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Полезное – вместе — Открытие марафона. Приветственное слово',
  'Видео-лекция из курса "Полезное – вместе" на тему "Открытие марафона. Приветственное слово".

Спикер: Анна Жигульская

В этом материале представлено приветственное слово на открытии марафона "Полезное – вместе":
- Знакомство с марафоном
- Цели и задачи марафона
- Программа мероприятий
- Приветствие участникам

Материал представляет введение в марафон "Полезное – вместе".',
  ARRAY['https://vkvideo.ru/video-172285001_456239164'],
  NOW()
);

-- Статья 81: Родители — агенты влияния. Организация питания в семье
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Родители — агенты влияния. Организация питания в семье',
  'Видео-лекция из курса "Полезное – вместе" на тему "Родители — агенты влияния. Организация питания в семье".

Спикеры: Екатерина Муравьева, Оксана Чернявская

В этом материале рассматривается роль родителей в организации питания в семье:
- Роль родителей как агентов влияния
- Организация здорового питания в семье
- Формирование пищевых привычек у детей
- Планирование семейного меню
- Культура питания в семье

Материал поможет родителям организовать здоровое питание в семье и стать позитивными агентами влияния.',
  ARRAY['https://vkvideo.ru/video-172285001_456239165'],
  NOW()
);

-- Статья 82: Отцовское лидерство
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Отцовское лидерство',
  'Видео-лекция из курса "Полезное – вместе" на тему "Отцовское лидерство".

Спикер: Алексей Чегодаев

В этом материале рассматривается тема отцовского лидерства в семье:
- Роль отца в семье
- Отцовское лидерство и его проявления
- Влияние отца на развитие детей
- Построение отношений отца с детьми
- Примеры эффективного отцовского лидерства

Материал поможет отцам развить лидерские качества и укрепить свою роль в семье.',
  ARRAY['https://vkvideo.ru/video-172285001_456239167'],
  NOW()
);

-- Статья 83: Межпоколенческие отношения в семье
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Межпоколенческие отношения в семье',
  'Видео-лекция из курса "Полезное – вместе" на тему "Межпоколенческие отношения в семье".

Спикер: Ирина Бушмелева

В этом материале рассматриваются межпоколенческие отношения в семье:
- Особенности отношений между поколениями
- Построение гармоничных отношений
- Преодоление конфликтов поколений
- Передача ценностей и традиций
- Взаимопонимание между поколениями

Материал поможет выстроить гармоничные отношения между разными поколениями в семье.',
  ARRAY['https://vkvideo.ru/video-172285001_456239168'],
  NOW()
);

-- Статья 84: Дочки и сыночки. Культура здоровья с раннего возраста
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Дочки и сыночки. Культура здоровья с раннего возраста',
  'Видео-лекция из курса "Полезное – вместе" на тему "Дочки и сыночки. Культура здоровья с раннего возраста".

Спикер: Наталья Яценко

В этом материале рассматривается формирование культуры здоровья у детей:
- Формирование культуры здоровья с раннего возраста
- Особенности воспитания девочек и мальчиков
- Привычки здорового образа жизни
- Роль семьи в формировании здоровья
- Практические рекомендации

Материал поможет родителям сформировать культуру здоровья у детей с раннего возраста.',
  ARRAY['https://vkvideo.ru/video-172285001_456239171'],
  NOW()
);

-- Статья 85: Добрые дела всей семьей
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Добрые дела всей семьей',
  'Видео-лекция из курса "Полезное – вместе" на тему "Добрые дела всей семьей".

Спикер: Саниям Коваль

В этом материале рассматривается участие семьи в добрых делах:
- Организация добрых дел всей семьей
- Волонтерство как семейная деятельность
- Воспитание доброты и отзывчивости у детей
- Примеры семейных добрых дел
- Влияние добрых дел на семейные отношения

Материал поможет организовать участие семьи в добрых делах и волонтерской деятельности.',
  ARRAY['https://vkvideo.ru/video-172285001_456239172'],
  NOW()
);

-- Статья 86: Спорт — норма жизни
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Спорт — норма жизни',
  'Видео-лекция из курса "Полезное – вместе" на тему "Спорт — норма жизни".

Спикер: Юлия Гущина

В этом материале рассматривается спорт как норма жизни:
- Спорт в повседневной жизни семьи
- Формирование привычки к спорту
- Выбор видов спорта для детей
- Организация спортивных занятий в семье
- Влияние спорта на здоровье и развитие

Материал поможет сделать спорт неотъемлемой частью жизни семьи.',
  ARRAY['https://vkvideo.ru/video-172285001_456239174'],
  NOW()
);

-- Статья 87: Всей семьей готовим дома
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Всей семьей готовим дома',
  'Видео-лекция из курса "Полезное – вместе" на тему "Всей семьей готовим дома".

Спикер: Андрей Савенков

В этом материале рассматривается совместное приготовление еды в семье:
- Организация семейного приготовления еды
- Вовлечение детей в кулинарию
- Развитие навыков через готовку
- Семейные традиции и рецепты
- Польза совместной готовки

Материал поможет организовать совместное приготовление еды как семейную традицию.',
  ARRAY['https://vkvideo.ru/video-172285001_456239175'],
  NOW()
);

-- Статья 88: Как говорить с детьми об экологии и культуре безопасности: от профориентации до образа жизни
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как говорить с детьми об экологии и культуре безопасности: от профориентации до образа жизни',
  'Видео-лекция из курса "Полезное – вместе" на тему "Как говорить с детьми об экологии и культуре безопасности: от профориентации до образа жизни".

Спикер: Ариадна Черкасова

В этом материале рассматривается общение с детьми об экологии и безопасности:
- Методы разговора с детьми об экологии
- Формирование культуры безопасности
- Связь экологии и профориентации
- Экология как образ жизни
- Практические подходы к экопросвещению

Материал поможет родителям говорить с детьми об экологии и безопасности эффективно и понятно.',
  ARRAY['https://vkvideo.ru/video-172285001_456239184'],
  NOW()
);

-- Статья 89: Читаем в семейном кругу
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Читаем в семейном кругу',
  'Видео-лекция из курса "Полезное – вместе" на тему "Читаем в семейном кругу".

Спикер: Светлана Кожевникова

В этом материале рассматривается семейное чтение:
- Организация семейного чтения
- Выбор книг для семейного чтения
- Польза совместного чтения
- Развитие любви к чтению у детей
- Семейные традиции чтения

Материал поможет организовать семейное чтение и привить любовь к книгам.',
  ARRAY['https://vkvideo.ru/video-172285001_456239185'],
  NOW()
);

-- Статья 90: Путешествия рядом с домом
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Путешествия рядом с домом',
  'Видео-лекция из курса "Полезное – вместе" на тему "Путешествия рядом с домом".

Спикер: Дмитрий Смирнов

В этом материале рассматриваются путешествия рядом с домом:
- Организация путешествий в своем регионе
- Открытие красоты родной земли
- Семейные поездки и походы
- Развитие через путешествия
- Планирование маршрутов

Материал поможет организовать интересные путешествия рядом с домом для всей семьи.',
  ARRAY['https://vkvideo.ru/video-172285001_456239188'],
  NOW()
);

-- Статья 91: Родительская лига Росатома
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Родительская лига Росатома',
  'Видео-лекция из курса "Полезное – вместе" на тему "Родительская лига Росатома".

Спикер: Елена Якуничкина

В этом материале представлена информация о Родительской лиге Росатома:
- Деятельность Родительской лиги Росатома
- Программы и проекты лиги
- Поддержка родителей
- Сообщество родителей
- Возможности участия

Материал познакомит с деятельностью Родительской лиги Росатома и возможностями участия.',
  ARRAY['https://vkvideo.ru/video-172285001_456239194'],
  NOW()
);

-- Статья 92: Как создать и развивать родительское сообщество?
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Как создать и развивать родительское сообщество?',
  'Видео-лекция из курса "Полезное – вместе" на тему "Как создать и развивать родительское сообщество?".

Спикер: Людмила Соловьева

В этом материале рассматривается создание и развитие родительского сообщества:
- Основы создания родительского сообщества
- Организация деятельности сообщества
- Привлечение участников
- Развитие и масштабирование
- Управление сообществом

Материал поможет создать и развить активное родительское сообщество.',
  ARRAY['https://vkvideo.ru/video-172285001_456239193'],
  NOW()
);

-- Статья 93: Всей семьей. Блогер — проводник в красоту родной земли
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Всей семьей. Блогер — проводник в красоту родной земли',
  'Видео-лекция из курса "Полезное – вместе" на тему "Всей семьей. Блогер — проводник в красоту родной земли".

Спикер: Гузель Исмагилова

В этом материале рассматривается роль блогера в открытии красоты родной земли:
- Блогерство как способ показать красоту региона
- Семейные путешествия и блогерство
- Создание контента о родной земле
- Влияние блогеров на туризм
- Примеры успешных блогеров

Материал поможет использовать блогерство для открытия красоты родной земли всей семьей.',
  ARRAY['https://vkvideo.ru/video-172285001_456239197'],
  NOW()
);

-- Статья 94: Ох, уж эти подростки. Любить, понимать и поддерживать
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Ох, уж эти подростки. Любить, понимать и поддерживать',
  'Видео-лекция из курса "Полезное – вместе" на тему "Ох, уж эти подростки. Любить, понимать и поддерживать".

Спикер: Наталья Яценко

В этом материале рассматривается работа с подростками:
- Понимание подросткового возраста
- Построение отношений с подростками
- Поддержка подростков в сложный период
- Коммуникация с подростками
- Практические советы родителям

Материал поможет родителям лучше понимать и поддерживать своих детей-подростков.',
  ARRAY['https://vkvideo.ru/video-172285001_456239202'],
  NOW()
);

-- Статья 95: Буллинг в школе и его последствия. Роль семьи в конфликтах ребенка
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Буллинг в школе и его последствия. Роль семьи в конфликтах ребенка',
  'Видео-лекция из курса "Полезное – вместе" на тему "Буллинг в школе и его последствия. Роль семьи в конфликтах ребенка".

Спикер: Ольга Гагаринская

В этом материале рассматривается проблема буллинга в школе:
- Понятие буллинга и его проявления
- Последствия буллинга для детей
- Роль семьи в предотвращении и решении конфликтов
- Помощь ребенку, столкнувшемуся с буллингом
- Профилактика буллинга

Материал поможет родителям понять проблему буллинга и поддержать ребенка в сложной ситуации.',
  ARRAY['https://vkvideo.ru/video-172285001_456239204'],
  NOW()
);

-- Статья 96: Семья в моде или мода в семье
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Семья в моде или мода в семье',
  'Видео-лекция из курса "Полезное – вместе" на тему "Семья в моде или мода в семье".

Спикеры: семья Подариных

В этом материале рассматривается мода в контексте семьи:
- Семейный стиль и мода
- Влияние моды на семейные отношения
- Формирование вкуса у детей
- Семейные традиции в моде
- Баланс между модой и практичностью

Материал поможет найти баланс между модой и семейными ценностями.',
  ARRAY['https://vkvideo.ru/video-172285001_456239208'],
  NOW()
);

-- Статья 97: Развитие у детей ориентации в пространстве и мелкой моторики руки
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Развитие у детей ориентации в пространстве и мелкой моторики руки',
  'Видео-лекция из курса "Полезное – вместе" на тему "Развитие у детей ориентации в пространстве и мелкой моторики руки".

Спикер: Ольга Калашникова

В этом материале рассматривается развитие пространственной ориентации и мелкой моторики:
- Развитие ориентации в пространстве у детей
- Развитие мелкой моторики руки
- Игры и упражнения для развития
- Влияние на общее развитие ребенка
- Практические рекомендации

Материал поможет родителям развить у детей пространственную ориентацию и мелкую моторику.',
  ARRAY['https://vkvideo.ru/video-172285001_456239209'],
  NOW()
);

-- Статья 98: Семейные привычки для укрепления иммунитета – новогодний выпуск
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Семейные привычки для укрепления иммунитета – новогодний выпуск',
  'Видео-лекция из курса "Полезное – вместе" на тему "Семейные привычки для укрепления иммунитета – новогодний выпуск".

Спикер: Полина Кущина

В этом материале рассматриваются семейные привычки для укрепления иммунитета:
- Привычки, укрепляющие иммунитет
- Организация здорового образа жизни в семье
- Новогодние традиции для здоровья
- Профилактика заболеваний
- Практические советы

Материал поможет сформировать семейные привычки для укрепления иммунитета всей семьи.',
  ARRAY['https://vkvideo.ru/video-172285001_456239213'],
  NOW()
);

-- Статья 99: Новогодний стол всей семьей
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Новогодний стол всей семьей',
  'Видео-лекция из курса "Полезное – вместе" на тему "Новогодний стол всей семьей".

Спикер: Андрей Савенков

В этом материале рассматривается подготовка новогоднего стола всей семьей:
- Организация совместной подготовки новогоднего стола
- Вовлечение всех членов семьи
- Новогодние рецепты и традиции
- Создание праздничной атмосферы
- Семейные традиции празднования

Материал поможет организовать подготовку новогоднего стола как семейную традицию.',
  ARRAY['https://vkvideo.ru/video-172285001_456239214'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Полезное – вместе%'),
  'Полезное – вместе'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Полезное – вместе%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Родители — агенты влияния%'),
  'Питание'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Родители — агенты влияния%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Отцовское лидерство%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Отцовское лидерство%'),
  'Воспитание'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Межпоколенческие отношения%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Дочки и сыночки%'),
  'Здоровье'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Дочки и сыночки%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Добрые дела всей семьей%'),
  'Волонтерство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Добрые дела всей семьей%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Спорт — норма жизни%'),
  'Спорт'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Спорт — норма жизни%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Всей семьей готовим дома%'),
  'Питание'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Всей семьей готовим дома%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как говорить с детьми об экологии%'),
  'Экология'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как говорить с детьми об экологии%'),
  'Безопасность'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Читаем в семейном кругу%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Читаем в семейном кругу%'),
  'Образование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Путешествия рядом с домом%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Путешествия рядом с домом%'),
  'Туризм'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Родительская лига Росатома%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как создать и развивать родительское сообщество%'),
  'Сообщества'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Как создать и развивать родительское сообщество%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Блогер — проводник в красоту родной земли%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Блогер — проводник в красоту родной земли%'),
  'Блогерство'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Ох, уж эти подростки%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Ох, уж эти подростки%'),
  'Воспитание'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Буллинг в школе%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Буллинг в школе%'),
  'Безопасность'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Семья в моде или мода в семье%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Развитие у детей ориентации в пространстве%'),
  'Развитие детей'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Семейные привычки для укрепления иммунитета%'),
  'Здоровье'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Семейные привычки для укрепления иммунитета%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Новогодний стол всей семьей%'),
  'Семья'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Новогодний стол всей семьей%'),
  'Питание'
);

-- Статья 100: Курс для развития НКО «Формула Будущего» — Консультация №1 / Группа 1
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №1 / Группа 1',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №1 / Группа 1.

Спикер: Андрей Андрусов

В этом материале представлена первая консультация для группы 1 курса «Формула Будущего»:
- Разбор вопросов участников группы
- Практические рекомендации по развитию НКО
- Индивидуальные консультации
- Ответы на вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239147?linked=1'],
  NOW()
);

-- Статья 101: Консультация №2 / Группа 1
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №2 / Группа 1',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №2 / Группа 1.

Спикер: Андрей Андрусов

В этом материале представлена вторая консультация для группы 1 курса «Формула Будущего»:
- Продолжение работы с участниками группы
- Разбор практических кейсов
- Консультации по развитию НКО
- Ответы на вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239157?linked=1'],
  NOW()
);

-- Статья 102: Консультация №3 / Группа 1
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №3 / Группа 1',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №3 / Группа 1.

Спикер: Андрей Андрусов

В этом материале представлена третья консультация для группы 1 курса «Формула Будущего»:
- Углубленная работа с участниками
- Разбор сложных вопросов развития НКО
- Практические рекомендации
- Индивидуальные консультации

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239168?linked=1'],
  NOW()
);

-- Статья 103: Консультация №4 / Группа 1
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №4 / Группа 1',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №4 / Группа 1.

Спикер: Андрей Андрусов

В этом материале представлена четвертая консультация для группы 1 курса «Формула Будущего»:
- Продолжение консультационной работы
- Разбор практических ситуаций
- Консультации по развитию НКО
- Ответы на вопросы участников

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239172?linked=1'],
  NOW()
);

-- Статья 104: Консультация №5 / Группа 1
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №5 / Группа 1',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №5 / Группа 1.

Спикер: Андрей Андрусов

В этом материале представлена пятая консультация для группы 1 курса «Формула Будущего»:
- Углубленная консультационная работа
- Разбор вопросов развития НКО
- Практические рекомендации
- Индивидуальные консультации

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239179?linked=1'],
  NOW()
);

-- Статья 105: Консультация №6 / Группа 1
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №6 / Группа 1',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №6 / Группа 1.

Спикер: Андрей Андрусов

В этом материале представлена шестая консультация для группы 1 курса «Формула Будущего»:
- Финальная консультация для группы
- Подведение итогов работы
- Финальные рекомендации
- Ответы на оставшиеся вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239187?linked=1'],
  NOW()
);

-- Статья 106: Консультация №1 / Группа 2
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №1 / Группа 2',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №1 / Группа 2.

Спикер: Анастасия Москвина

В этом материале представлена первая консультация для группы 2 курса «Формула Будущего»:
- Разбор вопросов участников группы
- Практические рекомендации по развитию НКО
- Индивидуальные консультации
- Ответы на вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239153?linked=1'],
  NOW()
);

-- Статья 107: Консультация №2 / Группа 2
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №2 / Группа 2',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №2 / Группа 2.

Спикер: Анастасия Москвина

В этом материале представлена вторая консультация для группы 2 курса «Формула Будущего»:
- Продолжение работы с участниками группы
- Разбор практических кейсов
- Консультации по развитию НКО
- Ответы на вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239158?linked=1'],
  NOW()
);

-- Статья 108: Консультация №3 / Группа 2
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №3 / Группа 2',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №3 / Группа 2.

Спикер: Анастасия Москвина

В этом материале представлена третья консультация для группы 2 курса «Формула Будущего»:
- Углубленная работа с участниками
- Разбор сложных вопросов развития НКО
- Практические рекомендации
- Индивидуальные консультации

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239165?linked=1'],
  NOW()
);

-- Статья 109: Консультация №4 / Группа 2
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №4 / Группа 2',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №4 / Группа 2.

Спикер: Анастасия Москвина

В этом материале представлена четвертая консультация для группы 2 курса «Формула Будущего»:
- Продолжение консультационной работы
- Разбор практических ситуаций
- Консультации по развитию НКО
- Ответы на вопросы участников

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239174?linked=1'],
  NOW()
);

-- Статья 110: Консультация №5 / Группа 2
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №5 / Группа 2',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №5 / Группа 2.

Спикер: Анастасия Москвина

В этом материале представлена пятая консультация для группы 2 курса «Формула Будущего»:
- Углубленная консультационная работа
- Разбор вопросов развития НКО
- Практические рекомендации
- Индивидуальные консультации

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239180?linked=1'],
  NOW()
);

-- Статья 111: Консультация №6 / Группа 2
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №6 / Группа 2',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №6 / Группа 2.

Спикер: Анастасия Москвина

В этом материале представлена шестая консультация для группы 2 курса «Формула Будущего»:
- Финальная консультация для группы
- Подведение итогов работы
- Финальные рекомендации
- Ответы на оставшиеся вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239189?linked=1'],
  NOW()
);

-- Статья 112: Консультация №1 / Группа 3
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №1 / Группа 3',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №1 / Группа 3.

Спикер: Юрий Белановский

В этом материале представлена первая консультация для группы 3 курса «Формула Будущего»:
- Разбор вопросов участников группы
- Практические рекомендации по развитию НКО
- Индивидуальные консультации
- Ответы на вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239146?linked=1'],
  NOW()
);

-- Статья 113: Консультация №2 / Группа 3
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №2 / Группа 3',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №2 / Группа 3.

Спикер: Юрий Белановский

В этом материале представлена вторая консультация для группы 3 курса «Формула Будущего»:
- Продолжение работы с участниками группы
- Разбор практических кейсов
- Консультации по развитию НКО
- Ответы на вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239159?linked=1'],
  NOW()
);

-- Статья 114: Консультация №3 / Группа 3
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №3 / Группа 3',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №3 / Группа 3.

Спикер: Юрий Белановский

В этом материале представлена третья консультация для группы 3 курса «Формула Будущего»:
- Углубленная работа с участниками
- Разбор сложных вопросов развития НКО
- Практические рекомендации
- Индивидуальные консультации

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239169?linked=1'],
  NOW()
);

-- Статья 115: Консультация №4 / Группа 3
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №4 / Группа 3',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №4 / Группа 3.

Спикер: Юрий Белановский

В этом материале представлена четвертая консультация для группы 3 курса «Формула Будущего»:
- Продолжение консультационной работы
- Разбор практических ситуаций
- Консультации по развитию НКО
- Ответы на вопросы участников

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239173?linked=1'],
  NOW()
);

-- Статья 116: Консультация №5 / Группа 3
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №5 / Группа 3',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №5 / Группа 3.

Спикер: Юрий Белановский

В этом материале представлена пятая консультация для группы 3 курса «Формула Будущего»:
- Углубленная консультационная работа
- Разбор вопросов развития НКО
- Практические рекомендации
- Индивидуальные консультации

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239182?linked=1'],
  NOW()
);

-- Статья 117: Консультация №6 / Группа 3
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Консультация №6 / Группа 3',
  'Консультация из курса для развития НКО «Формула Будущего» — Консультация №6 / Группа 3.

Спикер: Юрий Белановский

В этом материале представлена шестая консультация для группы 3 курса «Формула Будущего»:
- Финальная консультация для группы
- Подведение итогов работы
- Финальные рекомендации
- Ответы на оставшиеся вопросы

Материал содержит практические консультации для развития НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239188?linked=1'],
  NOW()
);

-- Статья 118: Лекция №1/ Финансы/Финансирование для НКО: обзор источников
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция №1/ Финансы/Финансирование для НКО: обзор источников',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция №1/ Финансы/Финансирование для НКО: обзор источников.

Спикер: Анна Яковлева

В этом материале рассматриваются источники финансирования для НКО:
- Обзор основных источников финансирования НКО
- Гранты и конкурсы
- Частные пожертвования
- Краудфандинг
- Государственная поддержка
- Корпоративное спонсорство

Материал поможет сориентироваться в многообразии источников финансирования для НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239145?linked=1'],
  NOW()
);

-- Статья 119: Лекция №5/ Финансы/ Гранты для НКО: общий подход и обзор грантовых программ
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция №5/ Финансы/ Гранты для НКО: общий подход и обзор грантовых программ',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция №5/ Финансы/ Гранты для НКО: общий подход и обзор грантовых программ.

Спикер: Анна Яковлева

В этом материале рассматриваются гранты для НКО:
- Общий подход к работе с грантами
- Обзор основных грантовых программ
- Критерии отбора грантополучателей
- Требования к заявкам
- Стратегия участия в грантовых конкурсах

Материал поможет понять систему грантов и выбрать подходящие программы для участия.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239167?linked=1'],
  NOW()
);

-- Статья 120: Лекция № 7/ Финансы/ Источники финансирования и их влияние на стратегию и систему управления в НКО
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция № 7/ Финансы/ Источники финансирования и их влияние на стратегию и систему управления в НКО',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция № 7/ Финансы/ Источники финансирования и их влияние на стратегию и систему управления в НКО.

Спикер: Анна Яковлева

В этом материале рассматривается влияние источников финансирования на НКО:
- Влияние источников финансирования на стратегию НКО
- Влияние на систему управления
- Балансирование различных источников
- Планирование финансирования
- Устойчивость финансирования

Материал поможет понять, как источники финансирования влияют на стратегию и управление НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239177?linked=1'],
  NOW()
);

-- Статья 121: Лекция №2/ Менеджмент/ Эффективные программы, достойные зарплаты и устойчивое управление
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция №2/ Менеджмент/ Эффективные программы, достойные зарплаты и устойчивое управление',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция №2/ Менеджмент/ Эффективные программы, достойные зарплаты и устойчивое управление.

Спикер: Дарья Буянова

В этом материале рассматриваются вопросы менеджмента в НКО:
- Создание эффективных программ
- Вопросы оплаты труда в НКО
- Устойчивое управление организацией
- Баланс между эффективностью и социальной миссией
- Управление ресурсами

Материал поможет построить эффективную систему управления в НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239155?linked=1'],
  NOW()
);

-- Статья 122: Лекция №4/ Менеджмент/ Практическое управление НКО: организация процессов, работа с ресурсами и результатом
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция №4/ Менеджмент/ Практическое управление НКО: организация процессов, работа с ресурсами и результатом',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция №4/ Менеджмент/ Практическое управление НКО: организация процессов, работа с ресурсами и результатом.

Спикер: Дарья Буянова

В этом материале рассматриваются практические аспекты управления НКО:
- Организация процессов в НКО
- Работа с ресурсами
- Управление результатами деятельности
- Оптимизация процессов
- Измерение эффективности

Материал поможет организовать эффективное практическое управление НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239164?linked=1'],
  NOW()
);

-- Статья 123: Лекция №8/ Менеджмент/ Управление проектом
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция №8/ Менеджмент/ Управление проектом',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция №8/ Менеджмент/ Управление проектом.

Спикер: Дарья Буянова

В этом материале рассматривается управление проектами в НКО:
- Основы управления проектами
- Планирование проекта
- Управление командой проекта
- Контроль и мониторинг
- Завершение проекта

Материал поможет эффективно управлять проектами в НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239184?linked=1'],
  NOW()
);

-- Статья 124: Лекция № 3/ PR/ PR и коммуникации для НКО с бюджетом и без
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция № 3/ PR/ PR и коммуникации для НКО с бюджетом и без',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция № 3/ PR/ PR и коммуникации для НКО с бюджетом и без.

Спикер: Ирина Козловских

В этом материале рассматриваются PR и коммуникации для НКО:
- PR-стратегии для НКО
- Коммуникации с ограниченным бюджетом
- Бесплатные инструменты PR
- Работа с медиа
- Построение репутации

Материал поможет организовать эффективные PR и коммуникации независимо от бюджета.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239156?linked=1'],
  NOW()
);

-- Статья 125: Лекция № 6/ PR/ Сторителлинг и сториселлинг
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция № 6/ PR/ Сторителлинг и сториселлинг',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция № 6/ PR/ Сторителлинг и сториселлинг.

Спикер: Ирина Козловских

В этом материале рассматриваются сторителлинг и сториселлинг:
- Понятие сторителлинга
- Сториселлинг как инструмент PR
- Создание убедительных историй
- Использование историй в коммуникациях
- Примеры успешного сторителлинга

Материал поможет использовать сторителлинг и сториселлинг в PR-деятельности НКО.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239171?linked=1'],
  NOW()
);

-- Статья 126: Лекция №9/ PR/ Работа с брендом и основы медиапланирования
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Лекция №9/ PR/ Работа с брендом и основы медиапланирования',
  'Лекция из курса для развития НКО «Формула Будущего» — Лекция №9/ PR/ Работа с брендом и основы медиапланирования.

Спикер: Ирина Козловских

В этом материале рассматриваются работа с брендом и медиапланирование:
- Построение бренда НКО
- Работа с брендом
- Основы медиапланирования
- Выбор каналов коммуникации
- Планирование PR-кампаний

Материал поможет выстроить работу с брендом и организовать медиапланирование.',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239186?linked=1'],
  NOW()
);

-- Статья 127: Разбор положения грантового конкурса «80 добрых дел»
INSERT INTO knowledges (name, text, links, created_at)
VALUES (
  'Курс для развития НКО «Формула Будущего» — Разбор положения грантового конкурса «80 добрых дел»',
  'Разбор положения грантового конкурса из курса для развития НКО «Формула Будущего» — Разбор положения грантового конкурса «80 добрых дел».

Спикер: Анна Яковлева

В этом материале представлен разбор положения грантового конкурса «80 добрых дел»:
- Анализ условий конкурса
- Требования к заявкам
- Критерии оценки
- Рекомендации по подготовке заявки
- Типичные ошибки

Материал поможет правильно подготовить заявку на грантовый конкурс «80 добрых дел».',
  ARRAY['https://vkvideo.ru/playlist/-227855624_14/video-227855624_456239175?linked=1'],
  NOW()
);

-- Теги для новых статей базы знаний
INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Формула Будущего%'),
  'Формула Будущего'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Формула Будущего%'),
  'Развитие НКО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Консультация%Группа 1%' AND name LIKE '%Формула Будущего%'),
  'Консультации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Консультация%Группа 2%' AND name LIKE '%Формула Будущего%'),
  'Консультации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Консультация%Группа 3%' AND name LIKE '%Формула Будущего%'),
  'Консультации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Лекция%Финансы%' AND name LIKE '%Формула Будущего%'),
  'Финансы'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Лекция%Финансы%' AND name LIKE '%Формула Будущего%'),
  'Финансирование'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Лекция%Менеджмент%' AND name LIKE '%Формула Будущего%'),
  'Менеджмент'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Лекция%Менеджмент%' AND name LIKE '%Формула Будущего%'),
  'Управление НКО'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Лекция%PR%' AND name LIKE '%Формула Будущего%'),
  'PR'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Лекция%PR%' AND name LIKE '%Формула Будущего%'),
  'Коммуникации'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Разбор положения грантового конкурса%'),
  'Гранты'
);

INSERT INTO knowledge_tags (knowledge_id, tag)
VALUES (
  (SELECT id FROM knowledges WHERE name LIKE '%Разбор положения грантового конкурса%'),
  'Проектные заявки'
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

