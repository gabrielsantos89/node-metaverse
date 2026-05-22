import { UUID } from './UUID';

/**
 * Representa um item de inventário para ser enviado como
 * attachment de um group notice.
 *
 * O item DEVE estar no inventário do bot, ser copiável
 * e o bot precisa ter permissão de envio de notices no grupo.
 */
export class GroupNoticeAttachment
{
    /** UUID do item no inventário do bot */
    public itemID: UUID;

    /** UUID do dono do item (normalmente o agentID do bot) */
    public ownerID: UUID;

    /** Nome do item (exibido na notice) */
    public name: string;

    /** AssetType numérico conforme enum do SL (5=Object, 7=Notecard, 3=Landmark, etc.) */
    public assetType: number;

    public constructor(itemID: UUID, ownerID: UUID, name: string, assetType: number)
    {
        this.itemID    = itemID;
        this.ownerID   = ownerID;
        this.name      = name;
        this.assetType = assetType;
    }

    /**
     * Serializa o attachment no formato LLSD XML esperado pelo
     * campo BinaryBucket do pacote ImprovedInstantMessage.
     *
     * Referência: libopenmetaverse GroupManager.cs → GroupNotice.SerializeAttachment()
     * https://github.com/openmetaversefoundation/libopenmetaverse
     */
    public serialize(): Buffer
    {
        // O simulador do SL espera LLSD XML com item_id e owner_id
        const xml =
            `<?xml version="1.0" encoding="utf-8"?>\n` +
            `<llsd><map>` +
            `<key>item_id</key><uuid>${this.itemID.toString()}</uuid>` +
            `<key>owner_id</key><uuid>${this.ownerID.toString()}</uuid>` +
            `</map></llsd>`;

        return Buffer.from(xml, 'utf-8');
    }
}