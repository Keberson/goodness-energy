-- SQL скрипт для автоматической инициализации базы данных
-- Выполняется автоматически после создания таблиц через SQLAlchemy
-- Этот скрипт содержит только INSERT команды (без DELETE)

BEGIN;

-- Администратор
INSERT INTO users (login, password_hash, role, created_at) 
VALUES ('admin', '$2b$12$TkAtBetIeANABsoQ8d.R7.AVHURJPVSShdYdJGk9YXcdQzzV0mJUC', 'ADMIN', NOW())
ON CONFLICT (login) DO NOTHING;

-- НКО #1: ОО ТОС АГО "12а микрорайон"
INSERT INTO users (login, password_hash, role, created_at) 
VALUES ('npo1', '$2b$12$zCHnZ4WqVz9DtvXII/3VYOKmvTsntAb6ycB1Sod56VeSZzhqmIDVK', 'NPO', NOW())
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
  13.3456,
  13.3456,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo2', '$2b$12$BKXx9fTuiGNSeucFKJKy8.yvpavqKSdEBjwgfHvUIZYORTjcMCY46', 'NPO', NOW());

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
  14.3456,
  14.3456,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo3', '$2b$12$0lvHLtufLc.54jOfCSqe4eT/3viOW7S23sy1SjVM6TRClaYCmvdjG', 'NPO', NOW());

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
  15.3456,
  15.3456,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo4', '$2b$12$ZlHp5zqOkgURIeAdHiy9pOeX3xj3YsGw3yHrPyLqFcoFxQJ/j3yg6', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo4'),
  'Культурная база "Короленко 8" (МБУ "ЦМиТО УКСиМП"',
  'Основная деятельность:  
Ресурсный центр помощи НКО и сообществам, учреждениям культуры, образования

ЦА: 
Инициативные жители, сообщества, НКО, учреждения города',
  16.345599999999997,
  16.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo5', '$2b$12$CbKnHlDXJXnJNOT54Ce/OuGB88fZlF8.L/mTzqiwgs7z6cmFDEHrK', 'NPO', NOW());

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
  17.345599999999997,
  17.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo6', '$2b$12$.we.vPAXtqlQA3NcZrSIS.NLka1W83ExUnL5dG6hXI5YMocbm2hw2', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo6'),
  'Федерация картинга',
  NULL,
  18.345599999999997,
  18.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo7', '$2b$12$XBqEqK.QN/tvg1D.R48dmuMY7rG7Rx5UoXmni8NVjut.KUezQApyS', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo7'),
  'НКО "Резервный фонд поддержки гражданских инициатив города Зеленогорска"',
  'Три года назад Фонд планировали закрывать. Потом он стал площадкой по сбору средст в поддержку волонтеров СВО, т.к. других фондов в городе нет. 

Основаная детельность:
На сегодня принято решение оставить Фонд после окончания СВО. Он будет заниматься сбором пожертвований и помощью людям в тяжелых ситуациях (пожары, болезни и т.п.). 

ЦА:  
люди в сложной жизненой ситуации',
  19.345599999999997,
  19.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo8', '$2b$12$AH1xGcf2jVtXg1wLg6LJzOJg4K/F3wzfhfFBWIsRpRTo8ZdP8aK52', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo8'),
  'АНО "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"',
  NULL,
  20.345599999999997,
  20.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo9', '$2b$12$2jMgVmX.YXU6/IeGzeX6lOIFY67g5DybUJFat1YSQSebSPlSD6Afm', 'NPO', NOW());

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
  21.345599999999997,
  21.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo10', '$2b$12$hkwfBP2.gUDvAGRTQKem8eBKJvcdXCqggGmQr9J1AyhnuwHUyVbRy', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo10'),
  'АНО КРЦРМСИГ ЕЛЕНЫ ЖИВАЕВОЙ',
  'Информация об организации АНО КРЦРМСИГ Елены Живаевой',
  22.345599999999997,
  22.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo11', '$2b$12$XNelCEZuAy7.AryY0rLMnO/yliOsG/nnh.xabGd5KRprooYyl/Eze', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo11'),
  'АНО Ресурсный центр',
  NULL,
  23.345599999999997,
  23.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo12', '$2b$12$4UYtsWlPsa91be0WH7svpOo/d2YC4PC.SH9TDcPOoc6TX0bK9LfoS', 'NPO', NOW());

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
  24.345599999999997,
  24.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo13', '$2b$12$9CsXDUKa9lzB2fbMeQ1pZ.A3yHaKYClyrCTlf4GuISicy/O7G7r6O', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo13'),
  'АНО Центр досуга и развития детей',
  NULL,
  25.345599999999997,
  25.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo14', '$2b$12$nwrUXC5LxtqGV8WRxzdwvudhwP5a27hmcy/G4CyM8gIKyVKGd.9Oq', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo14'),
  'Автономная некоммерческая организация "Клуб компьютерного спорта и фиджитал-спорта "Кибер-атом"',
  'Основная деятельность: 
ОКВЭД 93.12 - Деятельность спортивных клубов. А если по факту, то занимаюсь развитием компьютерного спорта и фиджитал-спорта в нашем городе, проведением мероприятий, турниров и просветительской работой в этой области

Ца: подростки 12-17 лет, а также их родители. С первыми ведем непосредственную работу по развитию их навыков в киберспорте и фиджитале, а со вторыми веду просветительскую работу и просто рассказываю, что киберспорт это не бесконтрольный гейминг и не игромания, а такое же спортивное направление, как футбол, шахматы и так далее, он также развивает определенные навыки, и дети там также получают определенные знания и необходимую для них в наше время социализацию.

План мероприятий до конца года 
В планах до конца года открыть детский клуб, уже подготовительные работы ведутся, смета на оборудование подготовлена, но основная проблема в его дороговизне. Открыть клуб на 10 компьютеров, две приставки и 1 VR-шлем даже не на топовом оборудовании, но на более-менее актуальном, стоит по моим подсчетам порядка полутора миллионов. Это без затрат на ремонт и остальные расходы',
  26.345599999999997,
  26.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo15', '$2b$12$niO.0W3ovQATJ3dtboupneaFB6IrSAbIgtmVxG3l.w/MJKKC9wNUW', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo15'),
  'БФ «Планета кошек»',
  'Благотворительный Фонд "Планета Кошек" — это проект помощи бездомным животным в Нижнем Новгороде!

Благотворительный Фонд "Планета Кошек" входит в состав многофункционального Центра помощи и реабилитации животных. Деятельность Фонда направлена на спасение животных, оказавшихся в сложных жизненных ситуация, брошенных на улице, нуждающихся в ветеринарной помощи!',
  27.345599999999997,
  27.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo16', '$2b$12$drx92/CC.9V8pppYM13HQ.ng1c.SXVdu.NkI1boWLD3TKBsWjLfNS', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo16'),
  'АНО ДПО "Техническая академия Росатома"',
  'На данный момент НКО нет. Находится на стадии формирования концепции и формализации идеи.',
  28.345599999999997,
  28.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo17', '$2b$12$v6itO4m42BtiKzl0p12UyO2v.znnDLTDE8XwSXKzUol/pMlhLb7Km', 'NPO', NOW());

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
  29.345599999999997,
  29.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo18', '$2b$12$L4hL/1Rkp2sFPU7JTUZdWeO/Hlwng9AEhuEg9zrsSzl1aD6YoP6Sq', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo18'),
  'ТРОО "ВПЦ" МИРНЫЙ ВОИН"',
  NULL,
  30.345599999999997,
  30.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo19', '$2b$12$IkMIh0vL8ol9LTq4PqpK6uvJmfyaZUwBCAQOEnp7U.2GRFYBn5mBC', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo19'),
  'СГОО БУМЕРАНГ ДОБРА',
  NULL,
  31.345599999999997,
  31.345599999999997,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo20', '$2b$12$LL1OpHMcDqSAmHa8edhPIO95A6.0ZiVyxeedz0FuvNgEDi3.LsNk.', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo20'),
  'ДоброЦентр при СО НКО Бумеранг добра',
  NULL,
  32.3456,
  32.3456,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo21', '$2b$12$XpxEdysg6aWITMBMZYPvI.MKm0oOJFMFgew22seAOJFlLVA7aIjZ2', 'NPO', NOW());

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
  33.3456,
  33.3456,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo22', '$2b$12$tlyVc4AqOsOwjPityJ3HMOeUEjulEUN3gMpPO0hwr9lnur6iO37Xm', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo22'),
  'БФМС Новое Усолье',
  'Основная деятельность: 
Активизация/развитие местного сообщества для улучшения жизни в городе

ЦА:
Неравнодушные жители, женщины 40+, семьи с детьми',
  34.3456,
  34.3456,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo23', '$2b$12$d6QVsWrbyTGFD1J1GQxaieTLveplUdR.ZgZjP1aGJhcg/RRaMzIru', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo23'),
  'УГМО ИОРОООО ВОИ',
  'Основная деятельность:
Организация работает по поддержке людей с инвалидностью и развитию адаптивной физической культуры и спорта в городе. Группа изучает более 25 человек различных нозологических групп. 

ЦА: 
Люди с инвалидностью всех возрастов',
  35.3456,
  35.3456,
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
INSERT INTO users (login, password_hash, role, created_at) VALUES
  ('npo24', '$2b$12$6NdyhduZv3rl7zxiUgT/Ouuj5tDHiGJjO5IOdj/VAnbt0pgTGTyw6', 'NPO', NOW());

INSERT INTO npos (user_id, name, description, coordinates_lat, coordinates_lon, address, city, timetable, links, status, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'npo24'),
  'АНО «Твердыми шагами»',
  'Автономная некоммерческая организация помощи детям с ограниченными возможностями здоровья, инвалидностью и их семьям.',
  36.3456,
  36.3456,
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
INSERT INTO users (login, password_hash, role, created_at) 
VALUES ('vol1', '$2b$12$iX4s22IyK/8DXJzJgf/n7Og1MqSXU9Tu4e7K6m/TFCSrcVkkdJS3y', 'VOLUNTEER', NOW())
ON CONFLICT (login) DO NOTHING;

INSERT INTO volunteers (user_id, first_name, second_name, middle_name, about, birthday, city, sex, email, phone, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'vol1'),
  'Андрей',
  'Миронов',
  NULL,
  'Активный волонтёр с опытом работы в социальных проектах',
  '1995-05-15 00:00:00',
  'Москва',
  'male',
  'andrey.mironov@example.com',
  '+79991234567',
  NOW()
);

-- Волонтёр 2: Кузов Максим
INSERT INTO users (login, password_hash, role, created_at) 
VALUES ('vol2', '$2b$12$iX4s22IyK/8DXJzJgf/n7Og1MqSXU9Tu4e7K6m/TFCSrcVkkdJS3y', 'VOLUNTEER', NOW())
ON CONFLICT (login) DO NOTHING;

INSERT INTO volunteers (user_id, first_name, second_name, middle_name, about, birthday, city, sex, email, phone, created_at)
VALUES (
  (SELECT id FROM users WHERE login = 'vol2'),
  'Максим',
  'Кузов',
  NULL,
  'Волонтёр, специализирующийся на экологических проектах',
  '1998-08-20 00:00:00',
  'Санкт-Петербург',
  'male',
  'maxim.kuzov@example.com',
  '+79991234568',
  NOW()
);

-- ============================================
-- События
-- ============================================

-- Событие 1: Экологическая акция
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos LIMIT 1),
  'Экологическая акция "Чистый город"',
  'Масштабная акция по уборке городских парков и скверов. Приглашаем всех желающих присоединиться к нам!',
  '2025-12-01 10:00:00',
  '2025-12-01 16:00:00',
  55.7558,
  37.6173,
  50,
  'Ангарск',
  'PUBLISHED',
  NOW()
);

-- Событие 2: Помощь пожилым людям
INSERT INTO events (npo_id, name, description, start, "end", coordinates_lat, coordinates_lon, quantity, city, status, created_at)
VALUES (
  (SELECT id FROM npos LIMIT 1 OFFSET 1),
  'Волонтёрская помощь пожилым людям',
  'Регулярное мероприятие по оказанию помощи пожилым людям: покупка продуктов, помощь по дому, общение.',
  '2025-12-05 09:00:00',
  '2025-12-05 13:00:00',
  59.9343,
  30.3351,
  30,
  'Волгодонск',
  'PUBLISHED',
  NOW()
);

-- ============================================
-- Теги событий
-- ============================================

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events LIMIT 1),
  'Экология'
);

INSERT INTO event_tags (event_id, tag)
VALUES (
  (SELECT id FROM events LIMIT 1 OFFSET 1),
  'Пожилые люди'
);

-- ============================================
-- Отклики на события
-- ============================================

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events LIMIT 1),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  NOW()
);

INSERT INTO event_responses (event_id, volunteer_id, created_at)
VALUES (
  (SELECT id FROM events LIMIT 1 OFFSET 1),
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol2')),
  NOW()
);

-- ============================================
-- Новости
-- ============================================

-- Новость 1 от НКО
INSERT INTO news (npo_id, volunteer_id, admin_id, name, text, type, created_at)
VALUES (
  (SELECT id FROM npos LIMIT 1),
  NULL,
  NULL,
  'Новая программа поддержки волонтёров',
  'Мы запускаем новую программу поддержки волонтёров. Теперь каждый активный волонтёр может получить сертификат и рекомендации для дальнейшего развития.',
  'BLOG',
  NOW()
);

-- Новость 2 от волонтёра
INSERT INTO news (npo_id, volunteer_id, admin_id, name, text, type, created_at)
VALUES (
  NULL,
  (SELECT id FROM volunteers WHERE user_id = (SELECT id FROM users WHERE login = 'vol1')),
  NULL,
  'Мой опыт волонтёрства',
  'Хочу поделиться своим опытом участия в экологических акциях. Это было незабываемо! Рекомендую всем попробовать.',
  'BLOG',
  NOW()
);

-- ============================================
-- Теги новостей
-- ============================================

INSERT INTO news_tags (news_id, tag)
VALUES (
  (SELECT id FROM news LIMIT 1),
  'Волонтёрство'
);

INSERT INTO news_tags (news_id, tag)
VALUES (
  (SELECT id FROM news LIMIT 1 OFFSET 1),
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

COMMIT;
