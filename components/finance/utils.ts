
// --- HELPER FUNCTIONS FOR VIETNAMESE CURRENCY READING ---
const DOCSO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function docSo3ChuSo(baso: number): string {
    let tram, chuc, donvi;
    let ketqua = '';
    tram = Math.floor(baso / 100);
    chuc = Math.floor((baso % 100) / 10);
    donvi = baso % 10;
    
    if (tram === 0 && chuc === 0 && donvi === 0) return '';
    
    if (tram !== 0) {
        ketqua += DOCSO[tram] + ' trăm ';
        if ((chuc === 0) && (donvi !== 0)) ketqua += ' linh ';
    }
    
    if ((chuc !== 0) && (chuc !== 1)) {
        ketqua += DOCSO[chuc] + ' mươi';
        if ((chuc === 0) && (donvi !== 0)) ketqua += ' linh ';
    }
    
    if (chuc === 1) ketqua += ' mười ';
    
    switch (donvi) {
        case 1:
            if ((chuc !== 0) && (chuc !== 1)) ketqua += ' mốt ';
            else ketqua += DOCSO[donvi];
            break;
        case 5:
            if (chuc === 0) ketqua += DOCSO[donvi];
            else ketqua += ' lăm ';
            break;
        default:
            if (donvi !== 0) ketqua += ' ' + DOCSO[donvi];
            break;
    }
    return ketqua;
}

export function docTienBangChu(soTien: number): string {
    if (soTien === 0) return 'Không đồng';
    let lan = 0;
    let i = 0;
    let so = 0;
    let ketqua = '';
    let tmp = '';
    const Tien = new Array();
    let ViTri = new Array();
    
    if (soTien < 0) return 'Số tiền âm';
    if (soTien > 8999999999999999) return 'Số quá lớn';
    
    ViTri[5] = 1000000000000000;
    ViTri[4] = 1000000000000;
    ViTri[3] = 1000000000;
    ViTri[2] = 1000000;
    ViTri[1] = 1000;
    ViTri[0] = 1;
    
    if (soTien > 0) {
        lan = 5;
    } else {
        lan = 0;
    }
    
    for (i = lan; i >= 0; i--) {
        tmp = Math.floor(soTien / ViTri[i]).toString();
        so = parseFloat(tmp);
        if (so > 0) {
            Tien[i] = docSo3ChuSo(so);
            soTien = soTien - parseFloat(tmp) * ViTri[i];
        }
    }
    
    if (Tien[5] && Tien[5].length > 0) ketqua += Tien[5] + ' triệu ';
    if (Tien[4] && Tien[4].length > 0) ketqua += Tien[4] + ' nghìn tỷ ';
    if (Tien[3] && Tien[3].length > 0) ketqua += Tien[3] + ' tỷ ';
    if (Tien[2] && Tien[2].length > 0) ketqua += Tien[2] + ' triệu ';
    if (Tien[1] && Tien[1].length > 0) ketqua += Tien[1] + ' nghìn ';
    if (Tien[0] && Tien[0].length > 0) ketqua += Tien[0];
    
    // Capitalize first letter and trim
    ketqua = ketqua.trim();
    return ketqua.charAt(0).toUpperCase() + ketqua.slice(1) + ' đồng';
}
