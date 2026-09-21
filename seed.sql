INSERT OR IGNORE INTO users (username, display_name, password_hash, role, active)
VALUES ('admin', '管理者', 'pbkdf2$310000$bGrv74vnU9wMS3hOJL42Lg$TbYRFZYpAizZSJd6cKRbGXwfDpJKYX9w3htmzm3XO9g', 'admin', 1);
INSERT OR IGNORE INTO products (category,name,price,pd_ems_half,max_qty,sort_order) VALUES
('修理','修理 1箇所',250000,0,NULL,10),('修理','全修理',1500000,0,NULL,20),('修理','出張修理',2500000,0,NULL,30),
('Engine','Street Engine Lv.1',10000000,1,NULL,100),('Engine','Sport Engine Lv.2',17000000,1,NULL,110),('Engine','Race Engine Lv.3',23000000,1,NULL,120),('Engine','Competition Engine Lv.4',25000000,1,NULL,130),
('Brakes','Street Brakes Lv.1',10000000,1,NULL,200),('Brakes','Sport Brakes Lv.2',17000000,1,NULL,210),('Brakes','Race Brakes Lv.3',23000000,1,NULL,220),('Brakes','Ceramic Brakes Lv.3',30000000,1,NULL,230),
('Transmission','Street Transmission Lv.1',10000000,1,NULL,300),('Transmission','Sport Transmission Lv.2',17000000,1,NULL,310),('Transmission','Race Transmission Lv.3',23000000,1,NULL,320),
('Suspension','Street Suspension Lv.1',4000000,1,NULL,400),('Suspension','Sport Suspension Lv.2',5000000,1,NULL,410),('Suspension','Race Suspension Lv.3',6000000,1,NULL,420),('Suspension','Competition Suspension Lv.4',7000000,1,NULL,430),
('Armor','20%',1000000,1,NULL,500),('Armor','40%',2000000,1,NULL,510),('Armor','60%',5000000,1,NULL,520),('Armor','80%',10000000,1,NULL,530),('Armor','100%',15000000,1,NULL,540),
('Turbo','Turbocharger Lv.1',8000000,1,NULL,600),('Harness','Racing Harness',20000000,1,NULL,700),
('Tires','Slicks',30000000,1,NULL,800),('Tires','Semi-slicks',30000000,1,NULL,810),('Tires','Offroad',30000000,1,NULL,820),
('Drivetrain','AWD',50000000,1,NULL,900),('Drivetrain','RWD',30000000,1,NULL,910),('Drivetrain','FRD',10000000,1,NULL,920),
('Engine Swap','I4',50000000,1,NULL,1000),('Engine Swap','V6',100000000,1,NULL,1010),('Engine Swap','V8',300000000,1,NULL,1020),('Engine Swap','V12',500000000,1,NULL,1030),
('Drift Tuning','Drift Tuning',30000000,1,NULL,1100),('Duct Tape','Duct Tape',100000,0,10,1200),('Exterior & Paint','Exterior & Paint',500000,0,NULL,1300);
