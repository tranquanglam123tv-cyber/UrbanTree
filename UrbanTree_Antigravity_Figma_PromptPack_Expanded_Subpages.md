# URBANTREE — ANTIGRAVITY + FIGMA PROMPT PACK (REBUILT)

**Phạm vi:** bộ prompt Antigravity hoàn chỉnh cho UI/UX, trang cấp 1/cấp 2/cấp 3, sub-pages, trạng thái tương tác, responsive, prototype và QA Figma của UrbanTree. Đây không phải roadmap FE hay tài liệu kiến trúc backend; tài liệu không khẳng định Figma đã được chỉnh sửa.

**Nguồn định hướng được giữ lại:** roadmap UrbanTree và prompt pack `UrbanTree_VanGogh_Green_Antigravity_Figma_Prompts_v2_Detailed.md`. Tài liệu này tổ chức lại prompt theo từng phase, giữ tinh thần **Verdant Starry Night**, các screen ID đã có (A01, A04–A19, P01–P04, M01–M10), đồng thời bổ sung inventory trang con cấp 2/cấp 3, route/entry point, trạng thái lỗi/quyền hạn, motion, responsive, prototype và tiêu chí nghiệm thu. Các chức năng/API chưa được xác minh phải được ghi là chưa xác định, không được tự giả định là có.

**Lưu ý nguồn:** roadmap và prompt pack gốc có một số khác biệt về palette màu và mapping screen ID Public Web. Prompt pack gốc dùng palette `#174B36`…; roadmap còn có palette `#216E52` và `#2D6A4F`. Không trộn các palette. Hãy kiểm tra Figma/design decision đã duyệt; nếu chưa có quyết định, dùng palette của prompt pack này làm bản đề xuất và ghi rõ cần xác nhận trước khi ghi. Public Web có mapping khác nhau giữa các tài liệu (ví dụ P02/P03/P04 và P05); giữ nguyên ID đã tồn tại trong Figma hoặc Screen Inventory được duyệt, không tự renumber. Tương tự, kiểm tra mapping M07/M08 trước khi tạo frame.

## Cách sử dụng

1. Mở roadmap và prompt pack này trong ngữ cảnh làm việc của Antigravity.
2. Chạy **Prompt 00 — Audit & Safety Gate** trước. Prompt này chỉ cho phép kiểm tra read-only và báo cáo.
3. Đọc báo cáo, kiểm tra phạm vi và xác nhận trước mọi thao tác ghi, cài đặt, kết nối MCP, thay đổi file hoặc chỉnh sửa Figma.
4. Chạy lần lượt Prompt 01 → 09, mỗi prompt trong một lượt riêng. Prompt 08 chuyên mở rộng các trang chức năng cấp 2/cấp 3 và trạng thái phụ; Prompt 09 là QA cuối. Không gửi tất cả cùng lúc.
5. Sau mỗi phase, kiểm tra Figma Desktop trực tiếp nếu khả dụng; chỉ tiếp tục khi đầu ra và phạm vi đã được xác nhận.
6. Không đánh dấu “hoàn thành” nếu chưa có bằng chứng. Nếu Antigravity không thể ghi hoặc đọc lại Figma, ghi `NOT VERIFIED IN FIGMA DESKTOP`.

---

# PROMPT 00 — AUDIT, AN TOÀN, DESIGN SYSTEM VÀ MOTION FOUNDATION

> Sao chép toàn bộ khối prompt sau vào Antigravity.

```text
Bạn là Senior Product Designer, UX Architect, Design Systems Engineer, UX Motion Designer và Design QA cho UrbanTree — hệ thống quản lý cây xanh đô thị có các luồng quản lý cây, QR Code, chăm sóc, sự cố, bản đồ, Public Web, Flutter Staff App và một số thông tin Blockchain theo roadmap.

MỤC TIÊU
Tạo UI/UX sản phẩm thực tế, có thể bàn giao cho frontend, trong Figma khi công cụ hiện tại hỗ trợ. Không làm poster/concept art thay cho giao diện nghiệp vụ. Không tự mở rộng nghiệp vụ ngoài roadmap. Không tuyên bố đã chỉnh sửa Figma nếu chưa ghi được và đọc lại/xác minh trực tiếp.

Trước khi tạo frame, đối chiếu mapping ID giữa roadmap, prompt pack và Figma hiện tại. Đặc biệt, Public Web có tài liệu dùng P01=profile/P02=form/P03=success/P04=lookup, trong khi roadmap có P01=profile/P02=public details/P03=form/P04=success/P05=lookup. Không tự đổi ID; báo cáo xung đột và xin xác nhận nếu mapping chưa được chốt. Với màu sắc, không trộn các bảng màu khác nhau trong cùng file.

GATE 0 — READ-ONLY TRƯỚC
1. Đọc roadmap UrbanTree và prompt pack này; đọc README, SECURITY, package.json và tài liệu liên quan trong repository nếu được cung cấp.
2. Kiểm tra OS, Node/npm, phiên bản/cấu hình Antigravity, Figma Desktop, CLI/MCP có sẵn và compatibility dựa trên tài liệu thực tế. Không giả định cấu hình của Claude Code/Cursor dùng được trong Antigravity.
3. Kiểm tra read-only cấu trúc file, branch/status nếu có, dependencies, Figma pages/frames/components/variables/prototypes và thay đổi chưa lưu nếu công cụ cho phép.
4. Không cài package, không sửa config/MCP, không đổi quyền, không xóa/ghi đè file hoặc frame, không chạy lệnh phá hủy trong phase này.
5. Trình bày: phát hiện, điều chưa biết, rủi ro, khả năng kết nối thực tế, phạm vi có thể làm và kế hoạch từng phase. Dừng và chờ phê duyệt trước mọi thao tác ghi.

QUY TẮC BẢO VỆ TÀI SẢN
- Không xóa hoặc ghi đè page/frame/component đã tồn tại hoặc đã duyệt. Nếu cần chỉnh sửa, nêu chính xác node và lý do rồi xin phép.
- Ưu tiên tạo page/frame mới và dùng naming convention; tạo checkpoint/backup khi khả thi và được phép.
- Không thay đổi repository/backend/API contract khi nhiệm vụ là thiết kế Figma.
- Không lộ token, secret, password, API key hoặc dữ liệu cá nhân vào Figma, log hay prompt.
- Nếu công cụ yêu cầu permission, đăng nhập, quyền truy cập hoặc thao tác có thể khó hoàn tác: dừng, mô tả chính xác hành động và xin xác nhận.
- Dữ liệu minh họa phải ghi rõ `SAMPLE DATA`/`PROTOTYPE ONLY`; không trình bày mock API, blockchain transaction, QR endpoint hoặc số liệu demo như dữ liệu thật.

PHONG CÁCH SẢN PHẨM — VERDANT STARRY NIGHT
Tạo ngôn ngữ thiết kế riêng lấy cảm hứng từ nhịp nét cọ cong, chuyển động bầu trời và tương phản của hội họa hậu ấn tượng; không sao chép nguyên bức tranh. Đổi cảm giác xanh dương Starry Night thành xanh rừng, xanh lá, olive và vàng kem. Đây là phần mềm quản trị: ưu tiên khả năng đọc dữ liệu, bản đồ, bảng, form, QR và trạng thái Blockchain. Artwork chỉ dùng tiết chế ở hero/login/empty state/section divider; không đặt texture dưới text dài, table, form hoặc map.

TOKENS CƠ SỞ — GIỮ NHẤT QUÁN
- Forest primary: #174B36
- Leaf green: #347A50
- Mid green: #4C956C
- Soft green: #A8C98B
- Pale green surface: #E0EBDD
- Warm cream: #F3E8B2
- Canvas background: #F6F5EC
- Card surface: #FFFFFF
- Main text: #28352B
- Secondary text: #667368
- Border: #DDE4D9
- Warning: #C78325
- Danger: #C7473A
- Info: chọn sắc xanh lá/xám phù hợp, không đưa blue thành primary.
- Font: chọn Inter hoặc Plus Jakarta Sans dựa trên môi trường/font có sẵn; chỉ chọn một font chính và ghi lại.
- Grid desktop 12 cột; spacing theo bội số 4/8px; desktop reference 1440×1024; kiểm tra 1280px, tablet và mobile.
- Radius: input 10–12px; card 14–18px; dialog 18–22px. Không tùy tiện thay đổi giữa trang.
- Button 44–48px desktop; input 44–48px; touch target ít nhất 44×44px khi phù hợp nền tảng.
- Bảng: row height 56–64px, header rõ, filter/search/pagination, loading/empty/error.
- Trạng thái không chỉ dùng màu; kết hợp label và icon/shape.

MOTION TOKENS — GIÁ TRỊ MẶC ĐỊNH ĐỀ XUẤT
Dùng làm chuẩn khởi điểm, không phải khẳng định repository đã cài sẵn:
- `motion.instant`: 100ms — phản hồi pressed/toggle ngắn.
- `motion.fast`: 150ms — hover/focus decoration/tooltip fade.
- `motion.standard`: 200ms — button, chip, tab, dropdown.
- `motion.panel`: 240ms — drawer/side panel.
- `motion.dialog`: 180–220ms — dialog enter/exit.
- `motion.page`: 200–260ms — chuyển nội dung prototype nếu thực sự cần.
- `motion.toast`: 160ms vào, 120ms ra.
- `motion.skeleton`: 1200–1600ms chỉ khi dùng shimmer; tắt/giảm với reduced motion.
- Easing: `ease-out` cho enter, `ease-in` cho exit, `ease-in-out` cho thay đổi liên tục nhỏ. Nếu Figma không hỗ trợ đúng token, ghi chú thay vì giả vờ.
- Hover: thay đổi nhẹ background/border/elevation; không scale làm layout nhảy.
- Pressed: phản hồi tức thì bằng shade/inset nhẹ; không dịch vị trí control.
- Không autoplay animation liên tục; không parallax/glow/particle mạnh trong UI nghiệp vụ.
- Tôn trọng `prefers-reduced-motion`: loại bỏ shimmer/parallax/transform không thiết yếu; vẫn thể hiện state bằng label/icon/border.

COMPONENTS/VARIANTS BẮT BUỘC
Button primary/secondary/tertiary/danger/icon; input/password/textarea/select/searchable select/date picker/file upload; badges sức khỏe GOOD/FAIR/POOR/DANGER/UNKNOWN; incident NEW/VERIFIED/ASSIGNED/IN_PROGRESS/RESOLVED/REJECTED; priority LOW/MEDIUM/HIGH/URGENT; blockchain PENDING/CONFIRMED/FAILED/VALID/MISMATCH/UNAVAILABLE; KPI card/chart card/table/filter bar/pagination/breadcrumb/tabs/modal/drawer/toast/tooltip/confirmation dialog; QR card/tree summary/incident card/staff avatar/activity timeline/upload preview/map marker-popup; skeleton/empty/error/success/offline warning; sidebar/top bar/mobile app bar/bottom navigation.

MỌI COMPONENT CÓ TƯƠNG TÁC PHẢI ĐƯỢC MÔ TẢ THEO MA TRẬN
1. Default.
2. Hover (nếu thiết bị có hover).
3. Focus-visible (keyboard).
4. Pressed/active.
5. Selected/expanded (nếu có).
6. Disabled/read-only (nếu có).
7. Loading/pending (nếu có).
8. Success (nếu có).
9. Error/invalid (nếu có).
10. Empty/no-results/offline/permission-denied khi phù hợp.
Mỗi state phải nêu: trigger, visual change, text/aria feedback, duration/easing, end state, keyboard/touch behavior và tiêu chí nghiệm thu. Không tạo state không liên quan chỉ để đủ danh sách.

OUTPUT PHASE 00
- Audit report và assumptions/unknowns.
- Page structure: `00 — Foundations`, `01 — Components`, `02 — Admin`, `03 — Public Web`, `04 — Mobile Staff`, `05 — Prototype`, `06 — Handoff` nếu file hiện tại cho phép.
- Color/text/effect/motion tokens; component variants; spacing/radius/elevation rules.
- Chưa tạo/sửa gì trong Figma cho đến khi được xác nhận sau audit.
- Kết thúc bằng bảng: item / current state / proposed action / write required? / risk / needs approval?
```

---

# PROMPT 01 — ADMIN SHELL, A01 LOGIN VÀ NAVIGATION

```text
Tiếp tục từ Foundation đã được duyệt. Không tạo design system thứ hai. Chỉ thiết kế A01 và shell dùng chung; không dựng tất cả trang nghiệp vụ trong prompt này.

A01 — LOGIN ADMIN/STAFF
- Desktop reference 1440×1024, split-screen khoảng 40/60 hoặc 44/56. Cột artwork dùng nét cọ xanh rừng/olive/vàng kem; cột form nền sáng, rõ, không đặt texture sau text.
- Nội dung: logo UrbanTree; heading “Đăng nhập hệ thống”; mô tả ngắn; email/username và password; toggle show/hide; CTA “Đăng nhập”; link quên mật khẩu chỉ khi phạm vi/backend có hỗ trợ. Không có public sign-up.
- Error login dùng thông báo chung, không tiết lộ email có tồn tại hay không. Session expired/server unavailable có trạng thái riêng.
- Responsive: tablet giảm artwork; mobile chuyển artwork thành header/crop ngắn, form full-width, CTA đủ rộng; keyboard không che field hiện tại.

LOGIN INTERACTIONS
- Field default: border token, label cố định phía trên, helper text nếu cần.
- Focus: ring rõ theo token, 150ms ease-out; không chỉ đổi placeholder.
- Invalid: border/error icon và error text cạnh field; focus chuyển tới lỗi đầu tiên sau submit; giữ giá trị hợp lệ.
- Password toggle: icon state đổi, accessible label “Hiện mật khẩu/Ẩn mật khẩu”; không reset giá trị.
- Submit idle: primary CTA. Hover 150ms ease-out; pressed 100ms; focus-visible luôn rõ.
- Submit pending: khóa double-submit, spinner nhỏ, nhãn “Đang đăng nhập…”, giữ chiều rộng nút; không xóa form.
- Failure: inline/banner message; không giả lập thành công. Retry quay về trạng thái có thể thao tác.
- Success prototype: chỉ nối đến Dashboard frame nếu frame tồn tại; ghi `PROTOTYPE FLOW`, không khẳng định backend auth đã chạy.
- Reduced motion: không có artwork chuyển động bắt buộc; feedback bằng state tĩnh.

ADMIN SHELL
- Sidebar desktop khoảng 248px; collapsed 80px nếu được duyệt. Logo, nav groups: Tổng quan; Bản đồ cây xanh; Quản lý cây; Loài cây; Sự cố; Lịch sử chăm sóc; Nhân viên; Blockchain & xác minh; Thông báo nếu bật; Cài đặt nếu thuộc phạm vi.
- Header: breadcrumb/page title, search nếu phù hợp, notifications, avatar/menu tài khoản. Main canvas #F6F5EC, cards #FFFFFF.
- Active nav: nền pale green + vạch forest; icon cùng hệ nét. Hover 150ms; focus-visible; selected không chỉ khác màu.
- Collapse sidebar 200ms ease-in-out; tooltip trên nav icon chỉ khi collapsed, delay ngắn và không che menu kế cận. Không để label wrap bất thường.
- Tablet/mobile: sidebar thành drawer. Open 240ms ease-out; overlay fade nhẹ; Escape/close button đóng; focus quản lý hợp lý; chọn nav thì drawer đóng. Không ép sidebar desktop vào viewport hẹp.
- Menu tài khoản/notification: popover có focus/keyboard, đóng bằng Escape; click outside chỉ đóng nếu không mất dữ liệu.
- Role ADMIN/STAFF: chỉ hiển thị menu theo quyền đã xác minh. Không coi UI hiding là security boundary; backend mới là nguồn quyết định quyền.

FRAMES / HANDOFF
Tạo A01 Login và Admin Shell Desktop/Tablet/Mobile; component page title, breadcrumb, toolbar, content container, table toolbar, toast/dialog. Đặt Auto Layout/constraints/variants; prototype login → Dashboard chỉ khi frame đích tồn tại. Không thêm đăng ký người dân, thanh toán, chat, IoT hoặc quản lý ngân sách.

ACCEPTANCE
- Layout nhất quán ở 1440, 1280, tablet và mobile.
- Không overflow/overlap; sidebar collapse/drawer có prototype rõ.
- Keyboard focus thấy được; Escape hoạt động ở menu/dialog thích hợp.
- Login có default/focus/invalid/loading/error/server unavailable; không có success giả.
- Chỉ báo frame đã ghi và đọc lại trong Figma khi đã xác minh trực tiếp.
```

---

# PROMPT 02 — A04 DASHBOARD VÀ A05 BẢN ĐỒ CÂY XANH

```text
Dựa trên Foundation và Admin Shell đã duyệt. Chỉ làm A04 và A05. Dùng dữ liệu mẫu nhất quán, ghi rõ SAMPLE DATA trong notes; không bịa số liệu production.

A04 — DASHBOARD
Layout: heading “Tổng quan cây xanh”, mô tả và thời điểm dữ liệu nếu có; KPI cards; chart sức khỏe cây; chart sự cố theo trạng thái; lượt chăm sóc theo tháng; map preview; danh sách sự cố mới nhất; activity timeline. Không nhồi quá nhiều chart/không dùng 3D chart.
KPI đề xuất theo nguồn: tổng cây, cây khỏe, cây cần theo dõi/nguy hiểm, sự cố chưa xử lý, sự cố ưu tiên cao/khẩn, bản ghi chăm sóc trong tháng. Chỉ hiển thị chỉ số mà dữ liệu/backend thực sự hỗ trợ.

KPI CARD INTERACTION
- Default: label + số + đơn vị/context; icon trên surface xanh nhạt.
- Hover 150ms ease-out: border/elevation tăng nhẹ; không scale/nhảy layout.
- Focus-visible nếu clickable; nếu không clickable, đừng tạo affordance giả.
- Loading: skeleton giữ đúng kích thước cuối để tránh layout shift.
- Empty: ghi “Chưa có dữ liệu cho khoảng thời gian này” và action hợp lý nếu có.
- Error: inline error + retry nếu retry có thật; không để số cũ trông như dữ liệu mới.
- Trend chỉ dùng khi có baseline so sánh thật; nếu demo phải đánh dấu SAMPLE DATA.

CHART INTERACTION
- Legend/series dùng màu + label/shape; tooltip hiển thị tên series, giá trị, đơn vị và khoảng thời gian.
- Hover/focus 100–150ms, tooltip không che heading/controls; keyboard alternative hoặc bảng dữ liệu khi khả thi.
- Không có dữ liệu: empty state riêng; lỗi: error state; tải: skeleton/chart placeholder.
- Filter date/area cập nhật đồng bộ toàn bộ widget chỉ khi có logic/data source; prototype ghi rõ nếu chỉ minh họa.

A05 — MAP
- Leaflet + OpenStreetMap là hướng triển khai theo roadmap; trong Figma dùng map mockup, không tuyên bố tile/live location đang chạy.
- Map chiếm 65–75% vùng làm việc; filter panel/search/legend không che controls quan trọng.
- Search mã cây/địa chỉ; filters loài cây, sức khỏe, trạng thái hồ sơ, sự cố; reset filters; toggle Map/List.
- Legend: GOOD xanh, FAIR vàng, POOR cam, DANGER đỏ, UNKNOWN xám; marker sự cố phải khác marker cây và có label/icon để không phụ thuộc màu.
- Marker click: selected marker nổi bật → popup với mã cây, loại cây, địa chỉ ngắn, health badge, “Xem chi tiết”. Click list row phải đồng bộ selected marker.
- Marker hover: tooltip ngắn, 150ms; selected state giữ cho đến khi chọn item khác/đóng panel. Không tạo click nhầm khi pan/zoom.
- Cluster chỉ dùng nếu thư viện và dữ liệu hỗ trợ; click cluster zoom/expand được ghi là prototype nếu chưa nối map thật.
- Loading map/data, no markers, no filter results, map unavailable/tile error, network error và permission denied phải tách biệt.
- Không yêu cầu geolocation để xem map. Nút locate chỉ hiện khi phạm vi và permission được xác minh.

RESPONSIVE
- Desktop: map lớn + filter đầy đủ.
- Tablet: filters trong drawer/side panel.
- Mobile web: nút “Bộ lọc”, panel/bottom sheet, list cards, map controls không bị sheet che; có map/list toggle.

PROTOTYPE
Dashboard → Map → marker popup → Tree Detail (chỉ khi frame tồn tại); filter → no results → reset → results. Chú thích mọi dữ liệu/mock map.

ACCEPTANCE
- Chart/metric không hiển thị dữ liệu giả như thật.
- Map marker, popup, selected list item và detail navigation nhất quán.
- Loading/empty/error/permission states có nội dung, CTA và đường thoát rõ.
- Không có layout shift lớn khi skeleton thay bằng data.
- Responsive không che control, filter hay nút reset.
```

---

# PROMPT 03 — A06–A10 QUẢN LÝ CÂY, LOÀI CÂY VÀ QR

```text
Thiết kế A06–A10 dùng cùng shell/tokens. Không xóa lịch sử; không tạo API/chức năng chưa xác minh. Tạo default + relevant interaction states.

A06 — TREE LIST
Heading “Quản lý cây xanh”, CTA “+ Thêm cây”; search mã/địa chỉ; filters loài, health, hồ sơ, tọa độ; reset; active filter chips; table gồm mã cây/QR, loại cây, địa chỉ, health, lần chăm sóc gần nhất, hồ sơ, actions; sort/pagination.
- Search: clear control chỉ xuất hiện khi có query; enter/click search theo pattern nhất quán; loading result không xóa query.
- Filter: selected chip và count nếu có dữ liệu; “Xóa tất cả” chỉ khi đang lọc; không cập nhật count giả.
- Sort: icon direction rõ, header có focus; không dùng animation cho cả bảng.
- Row hover 150ms; selected row có checkbox/border/background riêng, không nhầm với health status.
- Actions: view/edit/QR tùy quyền; tránh nhiều icon không nhãn. Menu row đóng bằng Escape.
- Bulk action chỉ active khi có selection; thao tác destructive cần confirmation.
- Loading skeleton rows; empty inventory có CTA “Thêm cây đầu tiên” nếu có quyền; filter-empty có “Xóa bộ lọc”; error có retry nếu thật.
- Tablet/mobile: table horizontal scroll có dấu hiệu rõ hoặc chuyển sang cards; không thu nhỏ text để ép vừa.

A07 — TREE DETAIL
Header: public code, loài/tên hiển thị, health, địa chỉ, action “Tải QR”, “Chỉnh sửa” theo role.
Tabs: Tổng quan; Lịch sử chăm sóc; Sự cố liên quan; QR Code; Blockchain — chỉ giữ tab có nghiệp vụ thật.
- Tab selected: underline/indicator + label; chuyển tab 150–200ms, không reset form chưa lưu âm thầm.
- Tổng quan: ảnh, thông tin, địa chỉ, map preview, ngày trồng/chiều cao/đường kính nếu có, ghi chú công khai.
- Timeline: loại việc, nhân viên chỉ nếu quyền cho phép, ngày, status và Blockchain status; phân biệt on-chain với DB record.
- Ảnh: loading/error/empty; lightbox nếu có, fade 180ms, đóng bằng Escape, focus return.
- Edit mode: save/cancel, validation; dirty state; rời trang khi unsaved → confirmation. Save pending giữ dữ liệu; failure hiển thị lỗi và cho retry.
- Không đưa ghi chú nội bộ/PII người phản ánh vào public view. Ngừng quản lý bằng INACTIVE/REMOVED theo quy tắc; không xóa lịch sử.

A08 — ADD/EDIT TREE FORM
Form dài dùng page hoặc drawer rộng, không dùng modal nhỏ. Nhóm: thông tin cây; vị trí (latitude/longitude/map picker); thông tin bổ sung; health/status; ảnh/ghi chú nếu có.
- Required/optional/helper text nhất quán; label không chỉ dùng placeholder.
- Validation on blur/submit phải ghi rõ; lỗi đặt sát field, hướng dẫn cách sửa, focus lỗi đầu tiên sau submit.
- Validate tọa độ trong phạm vi hợp lệ; mã trùng chỉ khi backend có kiểm tra. Nếu không xác minh được, ghi BACKEND DEPENDENCY.
- Save pending: disable duplicate submit, spinner + label; giữ layout và dữ liệu.
- Success chỉ khi được xác nhận; failure giữ input, hiển thị retry/cancel.
- Cancel có unsaved confirmation; Escape không làm mất dữ liệu im lặng.

A09 — SPECIES CATALOG
Danh sách loài cây, search/filter, detail/edit nếu roadmap hỗ trợ. Table/list có loading/empty/error, row hover/focus, pagination nếu cần. Không tự thêm taxonomy fields chưa có trong schema/roadmap. Form create/edit dùng cùng validation, save pending, error persistence và unsaved-changes pattern như A08.

A10 — QR MANAGEMENT
List/filter theo cây/trạng thái/ngày tạo chỉ khi dữ liệu có; QR preview có quiet zone, label/mã cây dễ đọc và URL công khai chỉ khi đã xác minh.
- Generate/download/print: idle → preparing → success/failure; success chỉ sau kết quả thật. Nếu Figma-only, đánh dấu PROTOTYPE ONLY.
- Reissue/revoke/regenerate phải có confirmation giải thích ảnh hưởng tới mã cũ; destructive button không đặt sát nút an toàn.
- Copy URL/hash: feedback “Đã sao chép” chỉ nếu hành vi được implement; trong prototype ghi minh họa.
- Print preview có page margin/QR size/text label; không đặt QR trên nền hoa văn.

MOTION / RESPONSIVE / QA
- Buttons 150–200ms hover, 100ms pressed, focus ring luôn hiển thị.
- Modal/dialog 180–220ms fade + scale rất nhẹ; easing ease-out vào/ease-in ra; không bounce.
- Drawer 240ms ease-out; overlay fade; giữ form state.
- Mobile form 1 cột, CTA full width, keyboard không che field; tabs có scroll/overflow rõ.
- Test: long labels, missing image, no QR, invalid coordinates, no results, permission denied, duplicate submission, save failure, unsaved changes, print layout.
```

---

# PROMPT 04 — SỰ CỐ, PHÂN CÔNG VÀ WORKFLOW

```text
Thiết kế nhóm màn hình sự cố theo roadmap và trạng thái thực tế đã xác minh. Không tự định nghĩa workflow backend mới. Các trạng thái đề xuất trong UI phải được đối chiếu nguồn nghiệp vụ trước khi dùng.

INCIDENT LIST
- Heading, search, filters theo status/severity/location/assignee chỉ khi hỗ trợ; table/cards gồm mã, loại, vị trí, cây liên quan, priority, status, người phụ trách và thời gian nếu có.
- Priority: LOW/MEDIUM/HIGH/URGENT bằng label + icon/shape + màu; status bằng label và màu, không chỉ màu.
- Sort/pagination/selected filters; row hover nhẹ; selected state không trùng status.
- Loading skeleton; no incidents; filter-empty; error/retry; permission-denied.

INCIDENT DETAIL
- Thông tin sự cố, mô tả, ảnh, vị trí, cây liên quan, người báo theo quyền, priority, status, assignee, timeline.
- Actions chỉ hiển thị khi role được phép: verify, assign/reassign, start, update progress, add note, resolve/reject. Không cho STAFF xử lý sự cố chưa giao nếu nghiệp vụ không cho phép.
- Change status: nếu có thể không hoàn tác, hiển thị confirmation với tên hành động và hậu quả; không dùng câu chung “Bạn có chắc?” đơn độc.
- Add note/upload ảnh: pending, success, failure; lỗi giữ nội dung đã nhập.
- Timeline append chỉ khi server xác nhận; prototype ghi SAMPLE/PROTOTYPE.

INCIDENT MAP
- Marker incident khác marker tree; selected incident đồng bộ với detail panel; filter severity/status; map unavailable có list fallback.
- Marker hover tooltip 150ms; click popup/detail; panel mở 240ms ease-out; mobile dùng bottom sheet/full page tùy viewport.

DIALOG / TOAST
- Confirmation: title nói rõ hành động, mô tả hậu quả, secondary cancel, destructive CTA; focus vào lựa chọn an toàn nếu phù hợp.
- Toast thành công chỉ sau phản hồi thành công; lỗi cần khắc phục dùng inline error thay toast tự biến mất quá nhanh.
- Dialog Escape/click outside theo độ an toàn; focus giữ trong dialog và trả về trigger khi đóng.

PROTOTYPE FLOW
Incident list → detail → assign/update → pending → success/error. Thêm luồng cancel confirmation và permission denied. Không nối frame chưa tồn tại.

ACCEPTANCE
- Mỗi status/action có rule rõ; không tạo trạng thái bất hợp lệ.
- UI phản ánh quyền, nhưng không giả định UI thay thế backend authorization.
- Lỗi mạng/submit không mất dữ liệu; không hiển thị success sớm.
- Dialog accessible, responsive và có đường cancel/thoát.
```

---

# PROMPT 05 — NHÂN VIÊN, LỊCH SỬ CHĂM SÓC, BLOCKCHAIN VÀ THÔNG BÁO

```text
Thiết kế các màn hình A11–A19 liên quan tới nhân viên, chăm sóc và Blockchain theo đúng roadmap hiện có. Nếu screen ID trong file Figma hiện hữu khác mô tả dưới đây, kiểm tra mapping trước khi tạo frame; không đổi ID tùy tiện.

A16 — USER/STAFF LIST; A17 — STAFF DETAIL (nếu mapping hiện hữu xác nhận)
- A16: danh sách nhân viên/người dùng gồm tên/tài khoản, role, trạng thái và thông tin hoạt động nếu có; search/filter/pagination theo dữ liệu đã xác minh.
- A17: chi tiết nhân viên có thể dùng drawer/page với hồ sơ, công việc được giao và lịch sử chăm sóc theo quyền; nếu roadmap/Figma chưa chốt, đánh dấu `NEEDS CONFIRMATION` thay vì tự tạo route mới.
- Row actions theo quyền. Role change/deactivate cần confirmation khi tác động quyền; không cho admin tự vô hiệu hóa chính mình nếu quy tắc hệ thống cấm.
- Role editor trình bày quyền theo nhóm, label dễ hiểu; không dùng checkbox không giải thích. Loading/empty/error/permission states.

CARE HISTORY / RECORDS
- A11 danh sách lịch sử chăm sóc: cây, loại hoạt động, nhân viên (nếu được phép), ngày, kết quả, status và blockchain state nếu có.
- A12 chi tiết bản ghi: thời gian, loại chăm sóc/kiểm tra, mô tả, ảnh, cây liên quan, actor theo quyền, metadata on-chain nếu đã xác minh.
- Filter/search, row hover/focus, timeline, empty/error/loading; giữ filter khi quay lại nếu prototype hỗ trợ.
- Không sửa/xóa lịch sử như dữ liệu thường nếu nghiệp vụ yêu cầu auditability; nếu không chắc, đánh dấu cần xác nhận.

A18 — BLOCKCHAIN ACTIVITY
- List event, transaction hash, status, timestamp, liên kết explorer chỉ khi network và URL đã xác minh.
- Badge: PENDING, CONFIRMED, FAILED, VALID, MISMATCH, UNAVAILABLE chỉ dùng theo semantics đã xác nhận. Không tự bịa số confirmations.
- Hash dài: truncate trực quan nhưng có copy/view full; không cắt dữ liệu khi copy.
- Copy interaction: pressed 100ms; feedback rõ. Chỉ hiện “Đã sao chép” nếu action thật được thực thi; trong prototype ghi PROTOTYPE.
- Pending/failed/confirmed states, loading, no transactions, network unavailable và error phải tách biệt.
- Ghi rõ dữ liệu nào on-chain, dữ liệu nào chỉ lưu trong database. Không dùng chữ “immutable/verified” nếu chưa có bằng chứng.

A19 — INTEGRITY VERIFICATION
- Hiển thị đối tượng được xác minh, expected/actual hash hoặc kết quả tương đương chỉ khi schema/flow thực tế có; không tự tạo thuật toán/field.
- States: chưa kiểm tra, đang kiểm tra, hợp lệ, mismatch, không khả dụng, lỗi. Mỗi state có icon + text + next step.
- “Đang xác minh” không dùng progress % nếu không có tiến độ đo được. Success chỉ sau response xác nhận.
- Mismatch phải có cảnh báo dễ hiểu, không dùng animation nhấp nháy; có reference/transaction link chỉ khi hợp lệ.

INTERNAL NOTIFICATIONS
- Notification list/popover: unread/read, timestamp, category và destination chỉ khi dữ liệu có.
- Open notification điều hướng tới frame phù hợp; mark read chỉ giả lập trong prototype khi chưa có backend.
- Empty state; loading/error; unread indicator có shape/label, không chỉ màu.

MOTION / QA
- Popover 150–200ms; side panel 240ms; toast 160ms in/120ms out; không chồng lên CTA quan trọng.
- Tables hỗ trợ sort/filter/pagination theo scope; long hash wrap/copy; permission states rõ.
- Kiểm tra pending/failed/unavailable/mismatch, dữ liệu thiếu, role không đủ quyền và không có transaction.
```

---

# PROMPT 06 — PUBLIC WEB P01–P04

```text
Thiết kế Public Web responsive cho người dân, theo prompt pack và roadmap. Public pages không được lộ thông tin nội bộ hoặc dữ liệu cá nhân người phản ánh. Không bắt buộc đăng nhập để tra cứu thông tin công khai nếu scope không yêu cầu.

P01 — PUBLIC TREE PROFILE VIA QR
- Hiển thị thông tin cây được phép công khai: mã cây, loài, ảnh, vị trí, tình trạng, lịch sử công khai phù hợp.
- Loading profile, valid profile, invalid/unknown QR, not found, server unavailable, offline/network error và restricted/private fields phải có state riêng.
- Không render tên/điện thoại người phản ánh, ghi chú nội bộ hay metadata không công khai.
- CTA báo sự cố chỉ khi feature đã được duyệt.

P02 — REPORT/FEEDBACK FORM
- Trường loại phản ánh, mô tả, ảnh, vị trí/contact chỉ nếu roadmap/schema yêu cầu. Nêu rõ thông tin nào được gửi và thông tin nào công khai/riêng tư.
- Label phía trên; helper text; required/optional; validation gần field; lỗi có hướng dẫn sửa.
- File upload: idle, selected preview, uploading nếu có tiến độ thật, invalid type/size, upload failure/retry, remove. Confirmation trước khi bỏ dữ liệu chưa gửi.
- Submit: idle → pending (disable double submit) → success khi server xác nhận hoặc error giữ dữ liệu. Không hiển thị mã ticket giả như thật.
- Nếu không có backend: prototype-only, placeholder được đánh dấu.

P03 — SUCCESS CONFIRMATION
- Chỉ xuất hiện sau successful submission trong prototype hoặc backend đã xác nhận. Hiển thị nội dung tiếp theo; mã tiếp nhận chỉ khi được tạo thật.
- Motion: icon/check fade/scale nhẹ 180ms; không confetti hoặc chuyển động gây nhiễu. Reduced-motion có state tĩnh.
- CTA quay về trang cây/trang chủ hoặc tra cứu phản ánh nếu flow có.

P04 — FEEDBACK LOOKUP
- Search bằng mã tiếp nhận/định danh được roadmap xác định; không đoán định dạng ID.
- States: empty input, invalid format (nếu rule xác minh), searching, found, not found, service error, status details.
- Không tiết lộ nội dung phản ánh của người khác khi chưa xác minh quyền truy cập.

PUBLIC WEB VISUAL / RESPONSIVE
- Verdant Starry Night tiết chế ở hero/empty illustration; nội dung, form, QR và map có bề mặt sạch.
- Mobile-first: 320px trở lên nếu phù hợp với scope; không overflow ngang; CTA/touch target tối thiểu 44px; keyboard không che input.
- Tablet/desktop có max-width và whitespace; typography rõ; hình ảnh có fallback.
- Hover chỉ cho thiết bị hỗ trợ; mọi hành động vẫn rõ trên touch; focus-visible phải có.

ACCEPTANCE
- Public/private data separation được ghi rõ.
- Invalid QR, missing data, upload failure, submit error và success state có đủ đường đi.
- Không có dữ liệu cá nhân nhạy cảm trong sample content.
- Responsive và reduced-motion được kiểm tra ở mức design review.
```

---

# PROMPT 07 — FLUTTER STAFF APP M01–M10

```text
Thiết kế UI/UX mobile cho Flutter Staff App. Đây là thiết kế mobile app, không chuyển thành React web. Dùng tokens/visual language chung nhưng tối ưu thao tác hiện trường, một tay, ánh sáng ngoài trời và mạng không ổn định.

APP SHELL
- Chọn app bar/bottom navigation theo roadmap; không tự thêm tab nghiệp vụ chưa duyệt. Touch targets ít nhất 44×44px khi phù hợp; spacing đủ để tránh chạm nhầm.
- Dùng safe area, keyboard inset và scroll; không để CTA bị keyboard che.
- Text đọc được ngoài trời; contrast rõ; không dùng artwork dưới form nghiệp vụ.
- Loading/empty/error/offline/sync pending/permission denied là các state khác nhau.

M01 — LOGIN
- Username/email + password; show/hide; validation; pending; failure; session expired; server unavailable. Không có public registration.
- Khi keyboard mở, form scroll tới field đang focus; submit button không bị che.

M02 — HOME
- Nhiệm vụ hôm nay, quá hạn, sự cố được giao và CTA chính “Quét QR”/“Công việc” nếu scope xác nhận.
- Task card pressed 100ms; selected/detail navigation rõ; không giả lập pull-to-refresh nếu không có behavior thật.
- Loading skeleton; no tasks; network/offline; retry/sync state. Không ghi “đã đồng bộ” khi chưa xác nhận.

M03 — QR SCANNER
- States: permission explainer, requesting permission, permission granted/scanning, denied, camera unavailable, scanning, valid scan, invalid QR, duplicate scan prevention, network error.
- Camera frame/scan guide rõ; nếu dùng scan animation, chuyển động nhẹ, không chạy liên tục quá nổi bật; reduced-motion có fallback tĩnh.
- Khi scan thành công, feedback icon/text rõ và điều hướng tới tree detail; không gửi nhiều lần cùng QR trong một lần quét.
- Manual code entry chỉ khi nghiệp vụ cho phép. Figma prototype không chứng minh camera thật hoạt động.

M04 — TREE DETAIL
- Mã cây, loài, health, vị trí, lịch sử/notes phù hợp quyền; CTA “Ghi nhận chăm sóc”/“Báo sự cố” chỉ khi scope cho phép.
- Ảnh loading/error/empty; content dài scroll đúng; back navigation giữ ngữ cảnh.

M05 — CARE/INSPECTION FORM
- Nhóm trường tình trạng, ghi chú, ảnh, vị trí theo yêu cầu thực tế; tránh bắt nhập dữ liệu thừa.
- Field states default/focus/invalid/disabled; photo picker states; preview/remove confirmation.
- Save draft chỉ khi có chức năng; submit pending, success, failure, retry, offline/sync pending. Lỗi không làm mất nội dung.
- Unsaved changes warning khi rời form; không hiển thị thành công trước server/local persistence được xác nhận.

M06 — TASK LIST
- Tabs/filter theo trạng thái chỉ khi workflow có; card chứa việc, cây/vị trí, deadline, status và priority.
- Empty task, filter-empty, loading, error, offline. Không hiển thị công việc ngoài quyền được giao.

M07/M08 — ASSIGNED INCIDENTS / INCIDENT DETAIL
- Danh sách chỉ có sự cố nhân viên được quyền xem/được giao theo rule thực tế.
- Detail: ảnh, mô tả, địa chỉ, cây liên quan, priority, status, timeline.
- Actions theo quyền: bắt đầu xử lý, cập nhật tiến độ, thêm ghi chú, chụp ảnh kết quả, hoàn thành nếu workflow cho phép.
- Complete action có confirmation khi khó hoàn tác; pending giữ dữ liệu; failure không đổi status thành success.

M09 — PERSONAL HISTORY (OPTIONAL)
- Chỉ thiết kế nếu roadmap xác nhận thời gian/phạm vi. Lịch sử chăm sóc của chính nhân viên, filter ngày/loại; không ưu tiên hơn MVP.

M10 — PROFILE/SETTINGS
- Thông tin tài khoản, role, trạng thái phiên; đổi mật khẩu chỉ khi backend hỗ trợ; logout confirmation.
- Không cho chỉnh role từ mobile.

MOBILE MOTION
- Tap/pressed: 100ms shade/ripple nhẹ theo pattern nền tảng; không dịch layout.
- Screen transition 200–260ms nếu prototype hỗ trợ; tránh hiệu ứng quá nặng.
- Bottom sheet 220–260ms ease-out; dismiss gesture chỉ nếu dễ khám phá và không xung đột scroll.
- Toast/snackbar không che CTA hoặc field; lỗi cần hành động giữ lâu hơn hoặc hiển thị inline.
- Tôn trọng reduced motion; không dùng rung/haptic giả trong prototype.

PROTOTYPE FLOW
Login → Home → Scan QR → Tree Detail → Care Form → success/status (ghi prototype/backend dependency); Home → Assigned Incidents → Detail → Update Progress → result. Tạo đủ loading/error/empty/permission-denied/offline states.

ACCEPTANCE
- Một tay thao tác được; touch target và spacing hợp lý.
- Permission denied có giải thích và đường đi tiếp; không ép user bật location/camera nếu không cần.
- Offline/sync pending không bị nhầm với success.
- Form giữ dữ liệu khi lỗi; scan không lặp; role/work assignment được tôn trọng.
```

---


---

# PROMPT 08 — MỞ RỘNG GIAO DIỆN CON CẤP 2/CẤP 3, SUB-PAGES VÀ TRẠNG THÁI NGHIỆP VỤ

> **Mục đích:** Prompt này buộc Antigravity triển khai đầy đủ các trang chức năng con nằm sau menu, tab, nút hành động và chi tiết bản ghi; không dừng ở dashboard/list/detail tổng quan. Chạy sau khi các màn hình cha và Design System đã được duyệt. Đây là phần của bộ prompt chính, không phải yêu cầu redesign độc lập.

```text
VAI TRÒ
Bạn là Senior Product Designer, UX Architect, Information Architect, Interaction Designer và Figma Prototyping Specialist. Hãy mở rộng UrbanTree bằng các trang chức năng cấp 2/cấp 3, sub-page, tab detail, form tạo/sửa, trang xác nhận, trạng thái rỗng/lỗi/quyền hạn và các nhánh điều hướng cần thiết. Bám sát roadmap, prompt pack và schema/API có sẵn. Không tự phát minh chức năng backend.

NGUYÊN TẮC PHÂN CẤP
- Cấp 1 = module/menu chính (Dashboard, Bản đồ, Cây xanh, QR, Sự cố, Chăm sóc, Blockchain, Người dùng/Phân quyền, Báo cáo, Cấu hình; Public Web; Staff App).
- Cấp 2 = trang làm việc trong module (danh sách, lịch, catalog, activity list, báo cáo, settings page).
- Cấp 3 = màn hình thao tác hoặc ngữ cảnh cụ thể (create/edit form, detail tabs, assign flow, confirm dialog, print preview, integrity result, upload error, permission denied).
- Không tạo frame mới cho từng hover riêng lẻ nếu có thể biểu diễn bằng component variant/state. Tạo frame riêng cho trang/route hoặc trạng thái làm thay đổi bố cục hay luồng người dùng.
- Mỗi trang con phải có đường đi vào, breadcrumb/back path, title, mục đích, CTA chính, quyền truy cập, trạng thái loading/empty/error/success và đường quay lại.
- Không tạo menu item chỉ để lấp đầy. Nếu roadmap không xác nhận nghiệp vụ, ghi `NEEDS PRODUCT CONFIRMATION` và không mô tả nó như tính năng đã tồn tại.
- Dùng Screen ID hiện có khi đã được xác nhận. Với trang mới chưa có ID, dùng ID tạm `Axx-S1`, `Axx-S2`, `Mxx-S1`, `Pxx-S1` hoặc tên dễ đọc; ghi rõ `PROPOSED ID — DO NOT RENUMBER EXISTING FRAMES` cho đến khi Screen Inventory được duyệt.
- Không sửa hoặc xóa frame đã duyệt. Tạo page `Subpages & States` hoặc phân nhóm phù hợp; trước khi ghi, báo cáo số frame cần tạo và chờ phê duyệt nếu công cụ yêu cầu.

A. CẤU TRÚC PAGE/FRAME TRONG FIGMA
Tổ chức pages như sau, nếu các page tương đương chưa tồn tại:
1. `00 — Foundations`
2. `01 — Components & States`
3. `02 — Admin Web`
4. `03 — Admin Subpages`
5. `04 — Public Web`
6. `05 — Staff Mobile`
7. `06 — Prototype Flows`
8. `07 — Handoff & QA`
Không duplicate page đã tồn tại; nếu tên hiện có khác, mapping và đề xuất trước khi đổi.

B. ADMIN WEB — INVENTORY TRANG CẤP 2/CẤP 3

B1. Dashboard (parent A04)
- A04-S1 `Dashboard / Filter by date & area`: bộ lọc khoảng thời gian/khu vực chỉ khi có dữ liệu hỗ trợ; chọn giá trị, apply/cancel, clear, loading, no-data, error.
- A04-S2 `Dashboard / Widget details`: nhấn widget KPI/chart mở trang liên quan hoặc drawer chi tiết chỉ nếu có route/luồng hợp lý; nếu không có destination được xác minh, widget không được tạo affordance click giả.
- A04-S3 `Dashboard / Export summary`: chỉ tạo nếu roadmap hoặc API có export. States: ready, preparing, exported, failed; nếu chưa xác minh, đánh dấu `NEEDS PRODUCT CONFIRMATION`.

B2. Bản đồ cây xanh (parent A05)
- A05-S1 `Map / Filter panel`: lọc health, species, hồ sơ, sự cố; selected filters, clear all, apply, no results, failed-to-load.
- A05-S2 `Map / Tree marker selected`: marker được chọn, popup, nút xem chi tiết, close popup, list-map selection sync.
- A05-S3 `Map / Tree list companion`: list view đồng bộ với map; row/card hover, selected, empty, error, pagination nếu cần.
- A05-S4 `Map / Incident marker detail`: thông tin sự cố và điều hướng detail chỉ theo quyền; marker sự cố phân biệt marker cây.
- A05-S5 `Map / Map unavailable`: lỗi tile/network, retry nếu hỗ trợ, fallback list; không để màn hình trắng.
- A05-S6 `Map / Mobile filter bottom sheet`: sheet, overlay, apply/reset/close; safe area, scroll, keyboard, dismiss không làm mất filter đã apply ngoài ý muốn.

B3. Quản lý cây xanh (parent A06/A07/A08)
- A06-S1 `Trees / Advanced filters`: loài, sức khỏe, trạng thái hồ sơ, khu vực và khoảng ngày nếu data hỗ trợ; filter chips, clear, empty results.
- A06-S2 `Trees / Bulk selection`: chọn một/nhiều/hàng hiện tại; indeterminate checkbox; bulk actions chỉ xuất hiện khi role và nghiệp vụ cho phép.
- A06-S3 `Trees / Bulk action confirmation`: nêu rõ số bản ghi và hậu quả; cancel là đường an toàn; destructive action phải có tên cụ thể.
- A07-S1 `Tree detail / Overview tab`: thông tin tổng quan, vị trí, ảnh, tình trạng.
- A07-S2 `Tree detail / Care history tab`: timeline và filter; empty history; load more/pagination nếu có.
- A07-S3 `Tree detail / Related incidents tab`: danh sách sự cố liên quan; empty, loading, error.
- A07-S4 `Tree detail / QR tab`: QR preview, public URL/status nếu có; download/print chỉ khi chức năng xác minh.
- A07-S5 `Tree detail / Blockchain tab`: transaction/verification status chỉ khi có dữ liệu thật; unavailable/empty/error.
- A07-S6 `Tree detail / Edit mode`: inline edit hoặc route edit nhất quán với A08; dirty state.
- A08-S1 `Tree form / Location picker`: map pin/coordinates, validation, invalid coordinate, location unavailable; geolocation chỉ khi scope và permission đã được xác minh.
- A08-S2 `Tree form / Image manager`: no image, selected preview, invalid type/size, upload pending/failure/retry/remove; không bịa tiến độ upload.
- A08-S3 `Tree form / Unsaved changes`: dialog rời trang, tiếp tục chỉnh sửa, bỏ thay đổi; giữ dữ liệu khi cancel.
- A08-S4 `Tree form / Save failed`: inline error, retry, return; dữ liệu đã nhập không mất.

B4. Danh mục loài cây (parent A09)
- A09-S1 `Species / List filters`: search, sort, filter nếu schema hỗ trợ.
- A09-S2 `Species / Detail`: thông tin loài chỉ gồm field có trong roadmap/schema; cây liên quan nếu API có.
- A09-S3 `Species / Create form`.
- A09-S4 `Species / Edit form`.
- A09-S5 `Species / Duplicate or invalid data`: chỉ tạo khi backend có quy tắc duplicate/validation; nếu chưa rõ thì ghi dependency.
- Cả list/detail/form có loading, empty, no results, error, permission denied; save pending giữ form; không tự thêm thông tin sinh học ngoài schema.

B5. Quản lý QR (parent A10)
- A10-S1 `QR / QR detail`: cây liên quan, mã, trạng thái, ngày tạo nếu có, URL chỉ khi được xác minh.
- A10-S2 `QR / Generate preview`: kích thước QR, quiet zone, mã cây, bản in; ghi `PROTOTYPE ONLY` nếu chưa tạo QR thật.
- A10-S3 `QR / Print layout`: khổ giấy, margin, QR không bị crop, text label đọc được; không dùng artwork làm nền QR.
- A10-S4 `QR / Regenerate confirmation`: giải thích mã cũ còn hiệu lực hay không chỉ khi quy tắc đã xác minh; không tự khẳng định.
- A10-S5 `QR / Download result`: preparing/success/failure; success chỉ khi action thực sự hoàn tất.
- A10-S6 `QR / Invalid or unavailable`: QR không có, dữ liệu liên kết lỗi, quyền không đủ.

B6. Sự cố (parent incident list/detail; giữ mapping ID hiện có)
- INC-S1 `Incidents / Filtered list`: filter trạng thái/priority/khu vực/người phụ trách chỉ theo schema.
- INC-S2 `Incident / Detail overview`: mô tả, ảnh, vị trí, cây liên quan, thời gian, priority/status.
- INC-S3 `Incident / Assignment drawer`: chọn người phụ trách chỉ theo role/API; loading, no eligible assignee, failed, saved.
- INC-S4 `Incident / Status transition confirmation`: trạng thái hiện tại → trạng thái đích, yêu cầu/note nếu có; cancel và pending.
- INC-S5 `Incident / Add note`: nhập note, validation, pending, failed giữ nội dung.
- INC-S6 `Incident / Evidence gallery`: xem ảnh, ảnh lỗi/mất, zoom/lightbox nếu khả thi, đóng Escape/focus return.
- INC-S7 `Incident / Resolve outcome`: summary và trạng thái chỉ sau xác nhận; nếu workflow không có resolution code thì không tự tạo field.
- INC-S8 `Incident / Permission denied`: giải thích không đủ quyền và đường quay lại, không lộ dữ liệu.

B7. Chăm sóc và lịch công việc (parent A11/A12 nếu ID được xác nhận)
- CARE-S1 `Care / Calendar month`: tháng, điều hướng tháng, event/assignment, legend; không dùng màu đơn độc.
- CARE-S2 `Care / Calendar week/day`: chỉ nếu roadmap cần view tuần/ngày; responsive.
- CARE-S3 `Care / Schedule detail`: cây/khu vực, loại chăm sóc, lịch, assignee và status theo field thật.
- CARE-S4 `Care / Create schedule`: form, validation, date/time, assignee; không tự tạo recurrence nếu chưa có.
- CARE-S5 `Care / Edit or cancel schedule`: dirty state, confirmation khi hủy, pending/error.
- CARE-S6 `Care / Assign staff`: assignee picker, no eligible staff, loading, save failure.
- CARE-S7 `Care / Record detail`: kết quả, ảnh, note, actor theo quyền, timestamp; chỉ field được xác minh.
- CARE-S8 `Care / History filter`: ngày, loại hoạt động, cây, nhân viên theo quyền; no results/reset.
- Nếu roadmap chỉ xác nhận lịch sử mà không xác nhận lập lịch/phân công, chỉ thiết kế các màn hình có căn cứ và đánh dấu các mục còn lại `NEEDS PRODUCT CONFIRMATION`.

B8. Blockchain & integrity (parent A18/A19; giữ ID hiện có)
- BC-S1 `Blockchain / Activity filters`: status, loại event, khoảng thời gian nếu có.
- BC-S2 `Blockchain / Transaction detail`: hash đầy đủ, status, timestamp, network và object liên quan chỉ khi có nguồn.
- BC-S3 `Blockchain / External explorer handoff`: outbound link chỉ khi URL/network đã xác minh; external-link warning.
- BC-S4 `Integrity / Start verification`: idle → pending → result; không cho nhấn lặp.
- BC-S5 `Integrity / Valid result`: thông tin kiểm tra được xác nhận, next step.
- BC-S6 `Integrity / Mismatch result`: cảnh báo, expected/actual chỉ nếu schema có, next step không phóng đại.
- BC-S7 `Integrity / Service unavailable`: trạng thái không khả dụng khác với mismatch và failed validation.
- BC-S8 `Blockchain / No activity`: empty state, không hiển thị số liệu giả.

B9. Người dùng và phân quyền (chỉ nếu module được xác nhận trong roadmap)
- USER-S1 `Users / List & filters`: tên hiển thị tối thiểu, email nếu role được phép, role/status; không hiển thị secret.
- USER-S2 `Users / Detail`: thông tin tài khoản và audit fields theo quyền.
- USER-S3 `Users / Create user`: form; không có public sign-up nếu account do Admin cấp.
- USER-S4 `Users / Edit user`: update profile/role chỉ theo quyền và policy.
- USER-S5 `Users / Role permission matrix`: permission table/read-only preview; không tự định nghĩa quyền backend; mapping role → permission phải lấy từ nguồn.
- USER-S6 `Users / Deactivate confirmation`: nêu tác động; không xóa audit history.
- USER-S7 `Users / Access denied`: giải thích rõ nhưng không lộ thông tin hạn chế.

B10. Báo cáo (chỉ khi roadmap/API xác nhận)
- REPORT-S1 `Reports / Overview`: metric definitions và thời gian.
- REPORT-S2 `Reports / Date & area filters`.
- REPORT-S3 `Reports / Detail table`: data table thay thế chart khi cần accessibility.
- REPORT-S4 `Reports / Export state`: preparing/success/failure chỉ khi export có thật.
- REPORT-S5 `Reports / No data / service error`.
- Không tự tạo báo cáo tài chính, KPI hoặc export format chưa có căn cứ.

B11. Cài đặt, thông báo, hồ sơ cá nhân (chỉ theo phạm vi được xác nhận)
- SETTINGS-S1 `Profile / View & edit`.
- SETTINGS-S2 `Password change` chỉ khi backend hỗ trợ; current/new/confirm, show/hide, policy hint lấy từ nguồn, invalid/current mismatch/pending/failure.
- SETTINGS-S3 `Notifications / List`; unread/read; open destination nếu có.
- SETTINGS-S4 `Notification preferences` chỉ khi có chức năng lưu preference.
- SETTINGS-S5 `Session expired`; re-auth path, không làm mất dữ liệu chưa lưu nếu có thể.
- SETTINGS-S6 `Logout confirmation`.
- SETTINGS-S7 `Activity log` chỉ khi roadmap/API hỗ trợ, không tự thêm audit schema.

C. PUBLIC WEB — CÁC TRANG CON
Giữ mapping P01–P04/P05 theo Figma/Screen Inventory đã duyệt. Nếu chưa có mapping, báo cáo xung đột trước khi ghi frame; không tự renumber.
- PUB-S1 `Public tree / Overview`: profile cây công khai.
- PUB-S2 `Public tree / Public care history`: chỉ sự kiện cho phép công khai; empty/limited history.
- PUB-S3 `Public tree / Map location`: map preview, location unavailable; không yêu cầu GPS để xem.
- PUB-S4 `Report / Category selection`: options phải lấy từ roadmap/schema.
- PUB-S5 `Report / Description validation`: counter/limit chỉ khi policy xác minh; required errors.
- PUB-S6 `Report / Photo upload`: permission denied, file too large/type unsupported, preview, retry, remove.
- PUB-S7 `Report / Privacy notice`: mô tả dữ liệu thu thập và hiển thị công khai theo chính sách đã xác nhận; nếu chưa có policy, ghi `NEEDS PRODUCT CONFIRMATION`.
- PUB-S8 `Report / Submit pending/failure`: disable duplicate submit; giữ dữ liệu khi failure.
- PUB-S9 `Report / Confirmation`: chỉ sau success; mã tiếp nhận không giả lập như thật.
- PUB-S10 `Feedback lookup / Search states`: empty/invalid/searching/found/not found/error.
- PUB-S11 `Feedback lookup / Result detail`: chỉ dữ liệu mà người dùng được phép xem; không lộ dữ liệu của người khác.
- PUB-S12 `Public / Not found / QR invalid / Service unavailable`: 3 state riêng, mỗi state có CTA phù hợp.
- Không tạo trang đăng nhập/đăng ký public nếu roadmap không yêu cầu.

D. STAFF APP — CÁC TRANG CON MOBILE
Giữ nguyên ID M01–M10 đã có. Dùng sub-ID cho frame phụ; thiết kế đúng Flutter/mobile, không chuyển thành web.
- M02-S1 `Home / Task filter`: filter chip/tab nếu workflow hỗ trợ; active/clear/no results.
- M02-S2 `Home / Task detail shortcut`: điều hướng tới task detail nếu frame tồn tại.
- M03-S1 `Scanner / Camera permission explainer`.
- M03-S2 `Scanner / Permission denied`.
- M03-S3 `Scanner / Camera unavailable`.
- M03-S4 `Scanner / Invalid QR`.
- M03-S5 `Scanner / QR resolved/loading`.
- M04-S1 `Tree detail / Care history`.
- M04-S2 `Tree detail / Related incident`.
- M05-S1 `Care form / Photo picker`.
- M05-S2 `Care form / Image preview/remove`.
- M05-S3 `Care form / Draft or offline pending` chỉ nếu offline/draft được hỗ trợ; nếu chưa xác minh, thể hiện là dependency.
- M05-S4 `Care form / Submit failure & retry`.
- M06-S1 `Tasks / Filtered list`.
- M06-S2 `Task / Detail & permitted action`.
- M07-S1 `Assigned incidents / Filtered list`.
- M08-S1 `Incident / Add progress note`.
- M08-S2 `Incident / Add result photo`.
- M08-S3 `Incident / Completion confirmation`.
- M08-S4 `Incident / Update failure`.
- M10-S1 `Profile / Edit basic info` chỉ nếu được phép.
- M10-S2 `Settings / Change password` chỉ khi hỗ trợ.
- M10-S3 `Settings / Logout confirmation`.
- Global mobile states: offline banner, session expired, permission denied, sync pending, server unavailable, empty task list, retry. Không giả định local persistence/offline mode nếu chưa có căn cứ.

E. COMPONENT-LEVEL SUBSTATES — KHÔNG BỎ SÓT
Tạo component variants hoặc state frames tương ứng cho:
- Buttons: default, hover, focus-visible, pressed, loading, disabled, destructive.
- Inputs: empty, filled, focus, valid, invalid, disabled, read-only, password reveal.
- Select/combobox: closed, open, highlighted option, selected, no options, search empty, error, disabled.
- Table: default, row hover, row selected, sort ascending/descending, loading skeleton, empty, no filter results, error, permission restricted.
- Dialog: closed, opening, open, submitting, validation error, success/close; Escape/backdrop behavior.
- Drawer/sheet: closed, open, scroll, submitting, error, dismiss confirmation if dirty.
- Toast/snackbar: info/success/warning/error, action, timeout/close; không tự biến error cần xử lý thành toast biến mất quá nhanh.
- Upload: idle, selected, validating, uploading (chỉ khi progress thật), success, invalid, failure, retry.
- QR: no QR, preview, preparing, download success/failure, print preview.
- Map: loading, loaded, selected marker, no results, unavailable, permission denied nếu có tính năng định vị.
- Blockchain: pending, confirmed, failed, unavailable, mismatch; semantics phải khớp nguồn.
- Pagination: first/previous/next/last disabled states; current page; page-size control chỉ khi hỗ trợ.
- Navigation: active, hover, collapsed, mobile drawer, submenu expanded, permission-hidden; không để route ẩn nhưng truy cập được trong prototype.

F. MOTION / MICRO-INTERACTION CHO MỌI TRANG CON
Áp dụng token hiện có trong Prompt 00; không đặt timing khác nhau tùy hứng.
- Hover decoration: 150ms ease-out; chỉ áp dụng khi thiết bị hỗ trợ hover.
- Pressed/tap feedback: 100ms; không làm layout dịch chuyển.
- Focus ring: hiện ngay, không delay animation làm mất dấu focus.
- Dropdown/popover: 150–200ms ease-out; transform tối đa 4px nếu cần, không bounce.
- Dialog: enter 200ms ease-out, exit 150ms ease-in; opacity + scale rất nhẹ (0.98→1), overlay fade; reduced-motion dùng fade ngắn hoặc trạng thái tĩnh.
- Drawer: 240ms ease-out; overlay đồng bộ; mobile bottom sheet 240ms ease-out.
- Tab: 150–200ms; underline/background transition; không animate toàn bộ nội dung nặng.
- Toast: vào 160ms, ra 120ms; không chồng CTA; pause/dismiss behavior chỉ khi được thiết kế rõ.
- Accordion/submenu: 180ms ease-out; nội dung không nhảy do chiều cao sai; có icon expanded/collapsed.
- Image/lightbox: 180ms fade; đóng bằng Escape; trả focus về trigger.
- Loading spinner không được dùng thay skeleton cho layout lớn; spinner không bao giờ đồng nghĩa success.
- Easing mặc định: ease-out cho enter/hover, ease-in cho exit, linear chỉ cho progress/spinner. Ghi `prefers-reduced-motion`/system reduced-motion behavior. Không dùng parallax, pulsing liên tục, bounce hoặc hiệu ứng trang trí lặp gây phân tâm.

G. RESPONSIVE — MỖI TRANG CON PHẢI CÓ QUY TẮC
- Desktop ≥ 1280px: shell đầy đủ, sidebar, table/side panel nếu cần.
- Tablet 768–1279px: sidebar có thể collapse; filter có thể thành drawer; table không được ép chữ quá nhỏ.
- Mobile web < 768px: một cột, CTA rõ, form 1 cột, bảng chuyển thành cards hoặc horizontal scroll có affordance; filter bottom sheet; không overflow ngang.
- Flutter: safe area, keyboard inset, scroll position, touch targets ≥44×44px khi phù hợp; ưu tiên thao tác một tay.
- Không coi breakpoint trên là luật cứng nếu design system hiện có định nghĩa khác; ghi rõ các breakpoint thực tế được chọn.
- Kiểm tra long text, tiếng Việt có dấu, tên đường dài, hash dài, không có ảnh, dữ liệu thiếu, zoom 200%, reduced motion.
- Không hide CTA hoặc thông tin an toàn chỉ vì màn hình nhỏ. Nếu content dài, scroll trong page/panel có chỉ báo và focus order hợp lý.

H. ACCESSIBILITY / KEYBOARD
- Tab order theo thứ tự đọc; focus-visible rõ và tương phản.
- Dialog mở: focus vào tiêu đề/nội dung hoặc action an toàn theo pattern; focus trap nếu component implementation hỗ trợ; đóng trả focus về trigger.
- Escape đóng popover/dialog/drawer khi phù hợp, nhưng nếu form dirty thì hỏi trước khi bỏ dữ liệu.
- Status luôn có text/icon, không chỉ màu; icon-only action có accessible name/tooltip.
- Error được gắn với field, không chỉ hiển thị toast. Sau submit invalid, focus tới field lỗi đầu tiên.
- Chart có summary/table alternative khi khả thi. Map có list fallback. Không phụ thuộc hover để xem thông tin thiết yếu.

I. PROTOTYPE FLOW BẮT BUỘC
Tạo prototype liên kết cho các luồng có căn cứ:
1. Dashboard → Map → Filter → Select marker → Tree detail → Care history/QR/related incidents.
2. Tree list → Filter/search → Detail → Edit → Validation error → Save pending → success hoặc failure giữ form.
3. Tree detail → QR preview → print/download preview → cancel/return; mọi action chưa implement phải ghi prototype-only.
4. Incident list → Filter → Incident detail → Assignment drawer → confirm → updated state (prototype-only nếu chưa có API).
5. Incident detail → Add note/photo → pending → success/failure.
6. Care history → record detail; schedule/calendar chỉ khi nghiệp vụ lập lịch được xác nhận.
7. Blockchain activity → transaction detail → integrity check → valid/mismatch/unavailable.
8. Public QR → public tree profile → report form → upload error/retry → submit error hoặc success → lookup (nếu luồng tồn tại).
9. Staff home → scan QR → invalid/valid → tree detail → care form → submit failure/retry/success.
10. Staff home → assigned incident → detail → update progress/photo → confirmation/result.
Không liên kết success nếu chưa có bước submit/persistence tương ứng. Không tạo dead-end; mọi trang có đường quay lại hoặc next step.

J. OUTPUT / ACCEPTANCE
Trước khi tạo:
- Xuất bảng `Screen Inventory` gồm: Module, Parent ID, Subpage ID, tên frame, cấp 1/2/3, route/entry point, CTA, role, states, responsive, dependency, status.
- Ghi `CONFIRMED FROM SOURCE`, `PROPOSED`, `NEEDS PRODUCT CONFIRMATION` cho từng mục.
- Báo cáo các frame hiện có và frame mới đề xuất; nêu mapping conflict và số lượng frame.
- Nếu cần ghi vào Figma, xin phê duyệt theo tool policy trước khi thao tác.

Sau khi tạo:
- Không báo “done” nếu chỉ sinh prompt hoặc tạo mockup chưa verify.
- Báo số frame đề xuất, số frame thực sự tạo, số frame đã mở lại/xác minh, các trang còn thiếu, lỗi prototype, lỗi responsive, dependency backend và các mục chưa xác nhận.
- Nếu Figma Desktop không thể kiểm chứng, ghi chính xác `NOT VERIFIED IN FIGMA DESKTOP`.
- Mỗi trang con phải có heading rõ, breadcrumb/back, CTA chính, state loading/empty/error/success/permission, responsive và prototype link hợp lý.
- Không để frame cấp 2/cấp 3 mồ côi; mọi frame phải được liên kết từ parent hoặc có lý do rõ trong handoff.
```

---

# SCREEN INVENTORY — DANH SÁCH TRANG CON ĐỀ XUẤT

Dùng bảng inventory trong Prompt 08 làm nguồn triển khai. Trước khi thêm frame, Antigravity cần map các nhóm sau với Screen ID đã có; các ID có hậu tố `-Sx` chỉ là ID đề xuất, không phải ID gốc của roadmap.

| Module cha | Trang cấp 2 | Ví dụ trang cấp 3 / trạng thái |
|---|---|---|
| Dashboard A04 | Filter, widget detail | No data, filter error, export state nếu có |
| Map A05 | Filter panel, list companion | Marker selected, incident popup, map unavailable |
| Trees A06–A08 | Advanced filters, detail tabs, form | Location picker, image manager, unsaved changes |
| Species A09 | List, detail | Create/edit, duplicate/validation nếu có |
| QR A10 | QR detail, generate preview | Print layout, regenerate confirmation, download error |
| Incidents | Filtered list, detail, assignment | Add note, evidence gallery, resolve confirmation |
| Care A11/A12* | Calendar, schedule/detail | Create/edit, assign staff, history filter |
| Blockchain A18/A19 | Activity filters, transaction detail | Valid, mismatch, unavailable, verification pending |
| Users/permissions* | User list, detail, role matrix | Create/edit/deactivate, access denied |
| Reports* | Overview, detail table | Date filter, export state, no data |
| Profile/settings* | Profile, notifications, session | Change password if supported, logout confirmation |
| Public Web | Tree profile, report, lookup | Upload errors, submit failure, confirmation |
| Staff M01–M10 | Task list, tree detail, incident detail | Camera permission, care form retry, completion confirmation |

`*` Chỉ triển khai các trang có căn cứ trong roadmap/API. Nếu chưa được xác nhận, để `NEEDS PRODUCT CONFIRMATION`, không dựng thành tính năng production.

---

## Quy tắc dùng sau khi mở rộng

- Chạy Prompt 08 sau khi màn hình cha đã được duyệt; yêu cầu Antigravity tạo Screen Inventory trước khi tạo frame.
- Duyệt inventory và mapping ID, rồi mới cho phép ghi vào Figma.
- Ưu tiên nhóm theo module; không yêu cầu tạo hàng loạt tất cả frame trong một lượt nếu dễ vượt context.
- Các ID `-S1`, `-S2` là đề xuất phân cấp; giữ nguyên ID cũ và đổi tên chỉ sau khi được duyệt.
- Prompt 09 vẫn là bước QA cuối để kiểm tra cả màn hình cha lẫn các trang con mới.


# PROMPT 09 — FIGMA QA, PROTOTYPE, RESPONSIVE VÀ HANDOFF

```text
Bạn là Senior UX QA và Design Systems Engineer. Audit toàn bộ Figma sau khi các phase được duyệt. Không đổi hướng nghệ thuật và không redesign toàn bộ nếu chỉ có một số lỗi. Không xóa/đổi tên frame cũ. Chỉ sửa issue đã chứng minh và nằm trong phạm vi được duyệt.

1. INVENTORY
- Liệt kê pages, frames, components, variants, variables, prototypes; mapping Screen ID → frame name.
- Tách rõ Done / In progress / Missing / Not verified.
- Nếu không thể đọc trực tiếp Figma Desktop, ghi `NOT VERIFIED IN FIGMA DESKTOP`.

2. VISUAL QA
- Tokens, typography, spacing, radius, elevation, icon style nhất quán.
- Sidebar/header/breadcrumb/page title/CTA nhất quán.
- Button/input/badge có size và state nhất quán.
- Artwork Van Gogh chỉ là lớp nhấn; không che bảng/form/map/text; không đổi primary sang blue.
- Không có overlap, clipped content, accidental overflow, label wrap xấu, text contrast kém hoặc layout shift giữa state.

3. INTERACTION QA
- Button: default/hover/focus/pressed/loading/disabled/error/success khi phù hợp.
- Form: validation, giữ input khi lỗi, unsaved changes, submit pending, duplicate prevention.
- Table: sort/filter/pagination/selection/empty/loading/error.
- Map: marker selected, popup, filter, list sync, map unavailable.
- Dialog/drawer/popover: open/close, Escape, focus return, viewport bounds, scroll.
- Toast: không báo success trước xác nhận, không che CTA.
- Prototype links phải trỏ tới frame có thật; không có dead-end không giải thích.

4. MOTION QA
- Hover/focus decoration khoảng 150ms; standard component transition khoảng 200ms; panel khoảng 240ms; dialog 180–220ms; toast 160ms in/120ms out, trừ khi token đã được duyệt khác.
- Easing enter ease-out, exit ease-in; không bounce, không animate layout nặng.
- Không animation liên tục gây phân tâm; reduced-motion behavior được ghi.
- Nếu Figma không thể mô phỏng behavior, thêm annotation thay vì khẳng định đã test runtime.

5. RESPONSIVE QA
- Desktop reference 1440×1024, 1280px, tablet và mobile theo từng platform.
- Sidebar drawer/collapse; tables/cards; map filters/sheet; mobile keyboard/safe area; long content; empty/error states.
- Không giải quyết responsive bằng cách giảm font xuống mức khó đọc hoặc ép tất cả vào một frame.

6. ACCESSIBILITY QA
- Focus-visible và keyboard order; labels/helper/errors; icon-only accessible name; status không chỉ bằng màu; contrast; touch targets; reduced motion.
- Ghi rõ đây là design review, không phải automated runtime accessibility test nếu chưa chạy test thực tế.

7. BUSINESS/DATA QA
- Không bịa API/data/permission/QR endpoint/Blockchain confirmation.
- Public pages không hiển thị PII/note nội bộ.
- UI không thể thay thế authorization backend.
- `PROTOTYPE ONLY`, `SAMPLE DATA`, `UNKNOWN`, `BACKEND DEPENDENCY` phải gắn đúng chỗ.

8. HANDOFF
- Pages: Foundations, Components, Admin, Public Web, Mobile Staff, Prototype, Handoff (chỉ tạo nếu được phép và phù hợp file hiện tại).
- Frames có ID theo mapping đã xác minh trong Figma/Screen Inventory; kiểm tra A01–A19, P01–P05 (nếu roadmap dùng P05) và M01–M10. Không tự tạo/đổi ID khi các nguồn không thống nhất.
- Auto Layout, constraints, component variants, variables/styles nếu được hỗ trợ.
- Ghi dev notes: states, validation, permissions, API-dependent data, responsive, motion tokens.
- Tạo danh sách component/tokens/screen còn thiếu và issue P0–P3.

SEVERITY
- P0: luồng cốt lõi không thể dùng hoặc dữ liệu/permission nguy hiểm; dừng bàn giao.
- P1: luồng chính hỏng, responsive/interaction quan trọng bị chặn.
- P2: vấn đề đáng kể nhưng có workaround.
- P3: polish/chi tiết nhỏ.

REPORT TEMPLATE
- Phase / scope.
- Read-only hay write.
- Figma pages/frames/components được kiểm tra.
- Issues: ID, severity, evidence, acceptance criteria.
- Changes: chính xác frame/component/node đã sửa; không ghi “sửa toàn bộ” mơ hồ.
- Test: PASS / FAIL / NOT TESTED từng tiêu chí.
- Figma verification: direct read-back hoặc NOT VERIFIED.
- Dependencies/unknowns/risks.
- Backup/rollback.
- Next step cần phê duyệt.

READY FOR FE IMPLEMENTATION chỉ khi các tiêu chí đã được kiểm tra đạt, issue còn lại được ghi rõ, API/dependency chưa biết được phân loại và Figma write/read-back được xác minh nếu báo cáo nói rằng đã chỉnh sửa Figma. Không dùng “100% hoàn hảo” hoặc tuyên bố không còn bug khi chưa có bằng chứng.
```

---

# APPENDIX — INTERACTION SPEC TEMPLATE CHO MỌI FRAME

Dùng bảng này trong Figma Dev Notes hoặc Handoff cho từng màn hình; không cần tạo mọi state nếu không phù hợp, nhưng phải ghi rõ N/A và lý do.

| Trường | Nội dung cần điền |
|---|---|
| Screen ID / Frame | ID và tên frame đúng Screen Inventory |
| User goal / role | Mục tiêu và role được phép |
| Entry / exit | Nguồn vào, back/next và đường thoát |
| Default state | Nội dung, dữ liệu và CTA ban đầu |
| Hover | Trigger, visual change, duration/easing; N/A trên touch-only |
| Focus-visible | Ring, thứ tự keyboard, focus target |
| Pressed / active | Phản hồi và end state |
| Selected / expanded | State được giữ khi nào, cách bỏ chọn/đóng |
| Loading / pending | Trigger, spinner/skeleton, double-submit prevention |
| Success | Điều kiện xác nhận, message, next step |
| Error / invalid | Nội dung lỗi, vị trí, cách khắc phục, retry |
| Empty / no results | Giải thích nguyên nhân và CTA hợp lý |
| Offline / permission | Dữ liệu/action nào bị ảnh hưởng và fallback |
| Animation | Trigger, property, duration, easing, reduced-motion alternative |
| Responsive | Desktop/tablet/mobile rules |
| Accessibility | Label, keyboard, contrast, target size, status text |
| Data/API dependency | Verified / Unknown / Backend dependency / Sample data |
| Acceptance | Các điều kiện PASS có thể kiểm chứng |
| Evidence | Ảnh/ghi chú/read-back hoặc Not verified |

## Global rule cho motion và trạng thái

- Chuyển động phục vụ phản hồi và định hướng, không phải trang trí liên tục.
- Không animate layout gây nhảy; ưu tiên opacity, color, border, transform nhẹ.
- Không dùng hover-only action; mọi action phải dùng được trên touch/keyboard.
- Không chỉ dùng màu để biểu thị success/error/priority/health; luôn có text hoặc icon/shape.
- Không tạo phần trăm tiến độ nếu không đo được; không báo success trước xác nhận.
- Không tự xóa input sau lỗi; giữ context và cho retry.
- Không hiển thị dữ liệu riêng tư ở Public Web.
- Không đánh dấu PASS cho phần chưa test; dùng NOT TESTED/NOT VERIFIED.

## Checklist nhanh trước khi gửi prompt tiếp theo

- [ ] Prompt hiện tại chỉ có một phạm vi rõ ràng.
- [ ] Đã kiểm tra đầu ra của phase trước.
- [ ] Screen IDs và frame đích tồn tại/được mapping rõ.
- [ ] Có states và motion specs phù hợp, không nhồi animation vô nghĩa.
- [ ] Responsive, keyboard, touch và reduced motion đã được xem xét.
- [ ] Dữ liệu mẫu/dependency được đánh dấu.
- [ ] Không có ghi đè/xóa/thay config ngoài phạm vi.
- [ ] Có tiêu chí nghiệm thu và báo cáo chưa xác minh.
