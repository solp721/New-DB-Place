# CoffeShop with Db-Design

CoffeShop ERD

[인터넷 커피 구매]

1. 고객의 주문 데이터를 관리하는 커피전문점이 있다.
2. 고객은 고객 이름으로 식별되고,주소와 휴대폰번호를 가진다.
3. 하나의 주문은 주문 날짜와 계산을 한 고객으로 식별된다.
4. 그리고 하나의 주문에는 현금,신용카드,수표 등의 지불방식을 기록해야 한다.
5. 각각의 주문은 하나 또는 그 이상의 메뉴항목으로 구성된다.주문은 각각의 메뉴 항목 단위로 이루어지고,주문 수량도 기록된다.
6. 메뉴항목은 항목번호로 식별되고,메뉴항목의 이름과 가격,그리고 커피,차,음료,제과,상품,세트메뉴,상품권,무선인터넷 같은 분류를 가진다..
7. 하나의 메뉴항목을 준비하는 데는 양도 다르고 종류도 다른 재료가 한 가지 이상 필요하다.
8. 이러한 재료들은 그 이름으로 식별되고,커피자바는 각각의 재료마다 킬로미터,리터,파운드 같은 주문 단위를 기록하며,양으로 재주문한다.
9. 하나의 재료는 하나 또는 그 이상의 메뉴항목에서 사용될 수 있고,하나의 메뉴항목은 하나 또는 그 이상의 재료로 구성될 수 있다.
10. 요리장은 특별 메뉴 항목에 사용되는 재료가 얼마나 되는지를 파악하고 있어야 한다.
11. CEO는 다양한 재료를 제공하는 공급업체 목록을 관리해야 한다.
12. 이들 공급업체들은 그들의 공급업체 번호로 식별되고,공급업체 이름과 주소를 가진다.
13. 재료의 가격은 공급업체마다 다르며 공급업체의 납기도 음식재료마다 다르다.

[개인과제물 제출]

● (커피전문점 관리시스템) 요구사항에 따라 데이터베이스를 설계하고, 이와 연동하는 샘플 프로그램을 작성하세요.
● 기본기능 : 메뉴검색->검색 결과에 대한 리스트보기->개별 메뉴에 대한 상세보기->구매하기->(결제하기) 또는 (추가 구매를 위해 계속해서 메뉴 검색하기)
● 구매 목록(장바구니)시 여려 개의 메뉴를 한번에 구매할 수 있어야 합니다.
● 프로그램 설계->구현->실행 결과를 보고서로 제출하세요.
● 제출 : 결과보고서 HWP파일로 제출 (요구사항, ERD, 구현결과) -> 개별 테스트 후 성적 부여

# [테스트1 2023-11-14 ]

B: 주문을 위한 메뉴항목 보기에서, 대표메뉴와 추천메뉴가 표시가됨
재고의 재고수량은 최초에 100으로 설정함
메뉴항목이 주문되는 수량과 각 메뉴항목에 사용되는 양에 따라서 재고수량은 변경됨
=> 통과

A: 추천메뉴는 매일 관리자가 변경할수있음
=> 404떠서 실패
=> -이후 구현 성공-

S: 추천메뉴가 지정되면 ,추천메뉴를 구성하는 모든재료는 (30 X 사용량) 이상의 재고수량을 가져야하며 , 그렇지 않은 경우에 공급업체를 통해 재료를 추가 구매함
=> 시도 못함 ㅠㅠ
=> -이후 구현 성공-
=> 요구사항 데로 구현은 했는데 뭔가좀 아쉬움.. 추천메뉴는 지속적으로 재고량 관리를 하면서 해당 재고수량을 가질수있도록 자동주문되는게 있으면 좋을듯

1차테스트 등급 - B

# [테스트2 2023-11-20]

B: 메인 화면에 최대 누적 판매 메뉴항목 2개에 대해서(순위,메뉴이름,판매량)을 출력함. 모든 주문에 대해서 메뉴항목별로 판매량을 합산해서 상위 2개를 출력함
=> 구현 성공

A: 현재 최대 판매량 메뉴항목을 추가 구매함으로써, 판매량 순위 및 판매량이 변경되는것을 보여주거나 순위에 없는 다른 도서를 추가 구매하여, 최대 판매량 도서에 진입되는것을 보여줌
=> 구현 성공

S: 관리자가 통계처리를 요청하면 월별 누적 판매 메뉴항목 2개에 대해서(년월,순위,메뉴이름,판매량)을 별도의[최다 판매메뉴] 테이블에 저장함. 년월이 다른 주문이 있어야 하므로 2023년 10월에 주문한 데이터를 임의로 삽입해 두고 11월에 주문한 값으로 월별 누적 판매량 데이터를 계산해야함
=> 아쉽게 실패..

2차테스트 등급 - A
