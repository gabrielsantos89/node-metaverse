import { UUID } from './UUID';

/**
 * Representa um item de inventário para ser enviado como
 * attachment de um group notice.
 *
 * O item DEVE estar no inventário do bot, ser copiável,
 * e o bot precisa ter permissão de envio de notices no grupo.
 */
export class GroupNoticeAttachment
{
    /** UUID do item no inventário do bot */
    public itemID: UUID;

    /** UUID do dono do item — deve ser o owner conforme LLInventoryItem::getPermissions().getOwner() */
    public ownerID: UUID;

    /** Nome do item (exibido na notice para o receptor) */
    public name: string;

    /**
     * AssetType numérico conforme enum do SL:
     * 0  = Texture   |  3  = Landmark  |  5  = Object
     * 7  = Notecard  |  10 = Script    |  18 = Sound
     * 20 = Animation |  24 = Gesture
     */
    public assetType: number;

    public constructor(itemID: UUID, ownerID: UUID, name: string, assetType: number)
    {
        this.itemID    = itemID;
        this.ownerID   = ownerID;
        this.name      = name;
        this.assetType = assetType;
    }

    /**
     * Serializa o attachment no formato EXATO produzido pelo viewer oficial.
     *
     * Fonte primária: ApertureViewer → indra/newview/llviewermessage.cpp:7815-7824
     */
    public serialize(): Uint8Array
    {
        const item_id  = this.itemID.toString();
        const owner_id = this.ownerID.toString();

        // Replica byte-a-byte o output de LLSDSerialize::serialize(..., LLSD_XML)
        const xml =
            '<? LLSD/XML ?>\n' +
            '<llsd><map>' +
            '<key>item_id</key><uuid>'  + item_id  + '</uuid>' +
            '<key>owner_id</key><uuid>' + owner_id + '</uuid>' +
            '</map></llsd>\n';

        const xmlBytes = Buffer.from(xml, 'utf-8');
        
        // Cria um Uint8Array puro com o tamanho exato (XML + 1 byte para o null-terminator)
        const result = new Uint8Array(xmlBytes.length + 1);
        
        // Usa o .set() nativo do Uint8Array, contornando a tipagem restrita do Buffer.copy()
        result.set(xmlBytes, 0);
        
        // Adiciona o null-terminator no último byte
        result[xmlBytes.length] = 0x00;

        return result;
    }
}